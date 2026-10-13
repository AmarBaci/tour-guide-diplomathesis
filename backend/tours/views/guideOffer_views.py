from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied, ValidationError
from django.db import transaction

from ..models import GuideOffer, Tour
from ..serializers import GuideOfferSerializer, GuideOfferUpdateSerializer
from users.models import GuideProfile

class GuideOfferViewSet(viewsets.ModelViewSet):
    """ViewSet for managing guide offers"""
    permission_classes = [IsAuthenticated]
    queryset = GuideOffer.objects.all()
    
    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return GuideOfferUpdateSerializer
        return GuideOfferSerializer

    def get_queryset(self):
        user = self.request.user
        
        if not user.is_authenticated:
            return GuideOffer.objects.none()
        
        queryset = GuideOffer.objects.select_related(
            'tour', 'guide', 'guide__user', 'created_by', 'tour__agency'
        ).prefetch_related('guide__languages')
        
        if user.user_type in ['agency_admin', 'agency_operator']:
            # Agency staff can see offers for their tours
            if hasattr(user, 'agency_admin_profile'):
                agency = user.agency_admin_profile.agency
            elif hasattr(user, 'agency_operator_profile'):
                agency = user.agency_operator_profile.agency
            else:
                return GuideOffer.objects.none()
            
            queryset = queryset.filter(tour__agency=agency)
        
        elif user.user_type == 'guide':
            # Guides can see their own offers
            if not hasattr(user, 'guide_profile'):
                return GuideOffer.objects.none()
            
            queryset = queryset.filter(guide=user.guide_profile)
        
        else:
            # Other user types see no offers
            return GuideOffer.objects.none()

        # Optional server-side filter by offer_type
        offer_type = self.request.query_params.get('offer_type', None)
        if offer_type:
            queryset = queryset.filter(offer_type=offer_type)

        return queryset

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except ValidationError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except PermissionDenied as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_403_FORBIDDEN
            )
        except Exception as e:
            # Log the full error for debugging
            print(f"Error creating guide offer: {str(e)}")
            import traceback
            traceback.print_exc()
            
            return Response(
                {'error': 'Internal server error'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def perform_create(self, serializer):
        # Check if user has permission to create offers
        user = self.request.user
        if user.user_type not in ['agency_admin', 'agency_operator']:
            raise PermissionDenied("Only agency staff can create guide offers.")
        
        # Validate agency ownership of the tour
        tour = serializer.validated_data.get('tour')
        if hasattr(user, 'agency_admin_profile'):
            agency = user.agency_admin_profile.agency
        elif hasattr(user, 'agency_operator_profile'):
            agency = user.agency_operator_profile.agency
        else:
            raise PermissionDenied("You don't have permission to create offers.")
        
        if tour.agency != agency:
            raise PermissionDenied("You can only create offers for your agency's tours.")
        
        # Check if guide is approved
        guide = serializer.validated_data.get('guide')
        if not guide.is_approved:
            raise ValidationError("You can only make offers to approved guides.")
        
        # Set the created_by field to the current user
        serializer.save(created_by=user)

    def perform_update(self, serializer):
        # Check if user has permission to update this offer
        instance = self.get_object()
        user = self.request.user
        
        if user.user_type == 'guide':
            # Guides can only update their own offers
            if not hasattr(user, 'guide_profile') or instance.guide != user.guide_profile:
                raise PermissionDenied("You can only update your own offers.")
        elif user.user_type in ['agency_admin', 'agency_operator']:
            # Agency staff can only update offers for their agency
            if hasattr(user, 'agency_admin_profile'):
                agency = user.agency_admin_profile.agency
            elif hasattr(user, 'agency_operator_profile'):
                agency = user.agency_operator_profile.agency
            else:
                raise PermissionDenied("You don't have permission to update this offer.")
                
            if instance.tour.agency != agency:
                raise PermissionDenied("You can only update offers for your agency.")
        else:
            raise PermissionDenied("You don't have permission to update offers.")
        
        # Save the updated instance
        updated_instance = serializer.save()
        
        # If offer is accepted, assign the guide to the tour
        if updated_instance.status == 'accepted':
            tour = updated_instance.tour
            tour.guide = updated_instance.guide
            tour.save()
        # If offer is rejected and the tour currently has this guide, remove the guide
        elif updated_instance.status == 'rejected' and updated_instance.tour.guide == updated_instance.guide:
            tour = updated_instance.tour
            tour.guide = None
            tour.save()

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """Custom action to accept an offer"""
        offer = self.get_object()
        
        # Ensure the user is the guide who received the offer
        if not request.user.is_authenticated or not hasattr(request.user, 'guide_profile') or offer.guide != request.user.guide_profile:
            raise PermissionDenied("You can only accept your own offers.")
        
        offer.status = 'accepted'
        offer.save()
        
        # Assign the guide to the tour
        tour = offer.tour
        tour.guide = offer.guide
        tour.save()
        
        return Response({'status': 'offer accepted'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Custom action to reject an offer"""
        offer = self.get_object()
        
        # Ensure the user is the guide who received the offer
        if not request.user.is_authenticated or not hasattr(request.user, 'guide_profile') or offer.guide != request.user.guide_profile:
            raise PermissionDenied("You can only reject your own offers.")
        
        offer.status = 'rejected'
        offer.save()
        
        # If this guide was assigned to the tour, remove them
        if offer.tour.guide == offer.guide:
            tour = offer.tour
            tour.guide = None
            tour.save()
        
        return Response({'status': 'offer rejected'})

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def apply(self, request):
        """Allow guides to apply for a tour"""
        if not hasattr(request.user, 'guide_profile'):
            return Response(
                {'error': 'Only guides can apply for tours.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        guide_profile = request.user.guide_profile
        
        # Check if guide is approved
        if not guide_profile.is_approved:
            return Response(
                {'error': 'Your guide profile is not approved yet.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        tour_id = request.data.get('tour')
        if not tour_id:
            return Response(
                {'error': 'Tour ID is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            tour = Tour.objects.get(id=tour_id)
        except Tour.DoesNotExist:
            return Response(
                {'error': 'Tour does not exist.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if tour already has a guide
        if tour.guide:
            return Response(
                {'error': 'This tour already has a guide assigned.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if guide has already applied
        existing_application = GuideOffer.objects.filter(
            tour=tour,
            guide=guide_profile
        ).exists()
        
        if existing_application:
            return Response(
                {'error': 'You have already applied for this tour.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create a new application
        application = GuideOffer.objects.create(
            tour=tour,
            guide=guide_profile,
            status='pending',
            offer_type='guide_application',
            created_by=request.user
        )
        
        serializer = GuideOfferSerializer(application, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)