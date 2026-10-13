from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, BasePermission
from rest_framework.exceptions import ValidationError  
from django.db import transaction
from django.db.models import Prefetch
from django.core.exceptions import ObjectDoesNotExist

from ..models import Booking, TourSchedule
from ..serializers import BookingSerializer, BookingListSerializer

class IsBookingOwnerOrAgencyMember(BasePermission):
    """
    Custom permission to only allow:
    - Booking owners to view/edit their own bookings
    - Agency members to view/edit bookings for their tours
    """
    def has_object_permission(self, request, view, obj):
        # Users can always access their own bookings
        if obj.tourist == request.user:
            return True
        
        # Agency members can access bookings for their tours
        if hasattr(request.user, 'agency_admin_profile'):
            return obj.tour_schedule.tour.agency == request.user.agency_admin_profile.agency
        if hasattr(request.user, 'agency_operator_profile'):
            return obj.tour_schedule.tour.agency == request.user.agency_operator_profile.agency
        
        return False

class BookingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing bookings.
    """
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated, IsBookingOwnerOrAgencyMember]
    
    def get_serializer_class(self):
        if self.action in ['list', 'my_bookings']:
            return BookingListSerializer
        return BookingSerializer
    
    def get_queryset(self):
        # Users can see their own bookings
        if self.request.user.is_authenticated:
            # For tourists, show only their bookings with optimized queries
            if hasattr(self.request.user, 'tourist_profile'):
                return Booking.objects.filter(
                    tourist=self.request.user
                ).select_related(
                    'tour_schedule__tour__agency',
                    'tour_schedule__tour__guide__user'
                ).prefetch_related(
                    'tour_schedule__tour__images'
                )
            
            # For agency members, show bookings for their tours
            if hasattr(self.request.user, 'agency_admin_profile'):
                agency = self.request.user.agency_admin_profile.agency
                return Booking.objects.filter(
                    tour_schedule__tour__agency=agency
                ).select_related(
                    'tourist',
                    'tour_schedule__tour__agency',
                    'tour_schedule__tour__guide__user'
                )
            
            if hasattr(self.request.user, 'agency_operator_profile'):
                agency = self.request.user.agency_operator_profile.agency
                return Booking.objects.filter(
                    tour_schedule__tour__agency=agency
                ).select_related(
                    'tourist',
                    'tour_schedule__tour__agency',
                    'tour_schedule__tour__guide__user'
                )
        
        return Booking.objects.none()
    
    def list(self, request, *args, **kwargs):
        """Override list method to add cache-control headers"""
        response = super().list(request, *args, **kwargs)
        
        # Add cache-control headers to prevent caching
        response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response['Pragma'] = 'no-cache'
        response['Expires'] = '0'
        
        return response
    
    @action(detail=False, methods=['get'], url_path='my-bookings')
    def my_bookings(self, request):
        """
        Custom action to get bookings only for the currently authenticated tourist.
        This is specifically for the tourist dashboard.
        """
        # Check if the user is a tourist
        if not hasattr(request.user, 'tourist_profile'):
            return Response(
                {"error": "Only tourists can access their bookings."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Use the optimized queryset from get_queryset
        bookings = self.get_queryset()
        
        # Apply pagination if needed
        page = self.paginate_queryset(bookings)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            response = self.get_paginated_response(serializer.data)
        else:
            # Serialize and return all results if no pagination
            serializer = self.get_serializer(bookings, many=True)
            response_data = {
                'bookings': serializer.data,
                'debug': {
                    'user': request.user.email,
                    'total_bookings': bookings.count(),
                    'user_type': request.user.user_type
                }
            }
            response = Response(response_data)
        
        # Add cache-control headers to prevent caching
        response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response['Pragma'] = 'no-cache'
        response['Expires'] = '0'
        
        return response
    
    def perform_create(self, serializer):
        """Create a new booking with proper error handling"""
        try:
            with transaction.atomic():
                # Get the tour schedule and lock it for update
                tour_schedule_id = serializer.validated_data['tour_schedule'].id
                
                try:
                    tour_schedule = TourSchedule.objects.select_for_update().get(id=tour_schedule_id)
                except ObjectDoesNotExist:
                    raise ValidationError("Tour schedule does not exist.")
                
                # Check availability
                number_of_people = serializer.validated_data['number_of_people']
                if tour_schedule.available_slots < number_of_people:
                    raise ValidationError(
                        f"Not enough available slots. Only {tour_schedule.available_slots} left."
                    )
                
                # Reduce available slots
                tour_schedule.available_slots -= number_of_people
                tour_schedule.save()
                
                # Create the booking with the current user as the tourist
                serializer.save(tourist=self.request.user)
                
        except Exception as e:
            # Log the error for debugging
            print(f"Error creating booking: {str(e)}")
            # Re-raise the exception to be handled by DRF
            raise
    
    def perform_destroy(self, instance):
        with transaction.atomic():
            # Get the tour schedule and lock it for update
            tour_schedule = TourSchedule.objects.select_for_update().get(
                id=instance.tour_schedule.id
            )
            
            # Return the slots to availability
            tour_schedule.available_slots += instance.number_of_people
            tour_schedule.save()
            
            # Delete the booking
            instance.delete()
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a booking"""
        booking = self.get_object()
        
        if booking.status == 'cancelled':
            return Response(
                {'error': 'Booking is already cancelled'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        with transaction.atomic():
            # Get the tour schedule and lock it for update
            tour_schedule = TourSchedule.objects.select_for_update().get(
                id=booking.tour_schedule.id
            )
            
            # Return the slots to availability
            tour_schedule.available_slots += booking.number_of_people
            tour_schedule.save()
            
            # Update booking status
            booking.status = 'cancelled'
            booking.save()
        
        return Response({'status': 'booking cancelled'})
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Confirm a booking (for agency use)"""
        booking = self.get_object()
        
        # Check if user has agency permissions
        if not (hasattr(request.user, 'agency_admin_profile') or 
                hasattr(request.user, 'agency_operator_profile')):
            self.permission_denied(request)
        
        booking.status = 'confirmed'
        booking.save()
        
        return Response({'status': 'booking confirmed'})