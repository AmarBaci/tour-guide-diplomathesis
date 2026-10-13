from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, BasePermission, IsAuthenticated
from django.db.models import Q, Prefetch
from django.db import transaction
from django.shortcuts import get_object_or_404

from ..models import Tour, TourImage, TourSchedule, GuideOffer
from ..serializers import TourSerializer, TourListSerializer, TourImageSerializer, GuideOfferSerializer, GuideOfferUpdateSerializer
from users.models import Agency, GuideProfile, CustomUser

class IsAgencyMemberOrReadOnly(BasePermission):
    """
    Custom permission to only allow agency members to edit tours.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        
        # Write permissions only for agency admins/operators
        if hasattr(request.user, 'agency_admin_profile'):
            return obj.agency == request.user.agency_admin_profile.agency
        if hasattr(request.user, 'agency_operator_profile'):
            return obj.agency == request.user.agency_operator_profile.agency
        
        return False

class TourViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing tours.
    """
    queryset = Tour.objects.filter(is_active=True)
    permission_classes = [IsAuthenticatedOrReadOnly, IsAgencyMemberOrReadOnly]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return TourListSerializer
        return TourSerializer
    
    def get_queryset(self):
        # Start with all active tours
        queryset = Tour.objects.filter(is_active=True)
        
        # Check if this is a browse request for guides
        is_browse_request = self.request.query_params.get('browse', 'false').lower() == 'true'
        
        # For tourists, show all active tours that have at least one upcoming schedule
        if self.request.user.is_authenticated and self.request.user.user_type == 'tourist':
            from django.utils import timezone as tz
            queryset = queryset.filter(schedules__date__gte=tz.now().date()).distinct()
        
        # For guides, show tours where they are assigned or have offers
        elif self.request.user.is_authenticated and self.request.user.user_type == 'guide':
            if is_browse_request:
                # For browsing, show tours without guides
                queryset = queryset.filter(guide__isnull=True)
            else:
                # For my tours, show tours where guide is involved
                guide_profile = self.request.user.guide_profile
                queryset = queryset.filter(
                    Q(guide=guide_profile) |
                    Q(guide_offers__guide=guide_profile)
                ).distinct()
        
        # Optimize queries with select_related and prefetch_related
        queryset = queryset.select_related(
            'agency', 'guide', 'guide__user'
        ).prefetch_related(
            Prefetch('images', queryset=TourImage.objects.all()),
            Prefetch('schedules', queryset=TourSchedule.objects.all()),
            Prefetch('guide_offers', queryset=GuideOffer.objects.select_related('guide', 'guide__user'))
        )
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        
        # Filter by tour type
        tour_type = self.request.query_params.get('tour_type', None)
        if tour_type:
            queryset = queryset.filter(tour_type=tour_type)
        
        # Filter by difficulty
        difficulty = self.request.query_params.get('difficulty', None)
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)
        
        # Filter by agency
        agency = self.request.query_params.get('agency', None)
        if agency:
            queryset = queryset.filter(agency__id=agency)
        
        # Filter by guide
        guide = self.request.query_params.get('guide', None)
        if guide:
            queryset = queryset.filter(guide__id=guide)
        
        # Filter by price range
        min_price = self.request.query_params.get('min_price', None)
        max_price = self.request.query_params.get('max_price', None)
        if min_price:
            queryset = queryset.filter(price_per_person__gte=min_price)
        if max_price:
            queryset = queryset.filter(price_per_person__lte=max_price)
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        """Override list method to add cache-control headers and debug info"""
        response = super().list(request, *args, **kwargs)
        
        # Add debug info to response
        if isinstance(response.data, dict):
            response.data['debug'] = {
                'user_type': request.user.user_type if request.user.is_authenticated else 'anonymous',
                'total_tours': Tour.objects.filter(is_active=True).count(),
                'filtered_tours': self.get_queryset().count()
            }
        
        # Add cache-control headers to prevent caching
        response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response['Pragma'] = 'no-cache'
        response['Expires'] = '0'
        
        return response
    
    def perform_create(self, serializer):
        # Set the agency based on the user's profile
        if hasattr(self.request.user, 'agency_admin_profile'):
            agency = self.request.user.agency_admin_profile.agency
            serializer.save(agency=agency)
        elif hasattr(self.request.user, 'agency_operator_profile'):
            agency = self.request.user.agency_operator_profile.agency
            serializer.save(agency=agency)
        else:
            # This shouldn't happen due to permissions, but just in case
            serializer.save()
    
    @action(detail=True, methods=['post'])
    def upload_image(self, request, pk=None):
        """Upload an image for a tour"""
        tour = self.get_object()
        serializer = TourImageSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(tour=tour)
            response = Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            response = Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Add cache-control headers to prevent caching
        response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response['Pragma'] = 'no-cache'
        response['Expires'] = '0'
        
        return response
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate a tour"""
        tour = self.get_object()
        tour.is_active = False
        tour.save()
        
        response = Response({'status': 'tour deactivated'})
        
        # Add cache-control headers to prevent caching
        response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response['Pragma'] = 'no-cache'
        response['Expires'] = '0'
        
        return response
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def assign_guide(self, request, pk=None):
        """Directly assign an approved guide to a tour (agency staff only)"""
        tour = self.get_object()
        user = request.user

        if not (hasattr(user, 'agency_admin_profile') or hasattr(user, 'agency_operator_profile')):
            return Response(
                {'error': 'Only agency staff can assign guides.'},
                status=status.HTTP_403_FORBIDDEN
            )

        guide_id = request.data.get('guide')
        if not guide_id:
            return Response({'error': 'guide field is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            guide_profile = GuideProfile.objects.get(id=guide_id)
        except GuideProfile.DoesNotExist:
            return Response({'error': 'Guide not found.'}, status=status.HTTP_404_NOT_FOUND)

        if not guide_profile.is_approved:
            return Response({'error': 'Guide is not approved.'}, status=status.HTTP_400_BAD_REQUEST)

        tour.guide = guide_profile
        tour.save()

        return Response({'status': 'guide assigned', 'guide_id': str(guide_id)})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def apply(self, request, pk=None):
        """Allow guides to apply for a tour"""
        tour = self.get_object()
        user = request.user
        
        # Check if user is a guide
        if not hasattr(user, 'guide_profile'):
            return Response(
                {'error': 'Only guides can apply for tours.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        guide_profile = user.guide_profile
        
        # Check if guide is approved
        if not guide_profile.is_approved:
            return Response(
                {'error': 'Your guide profile is not approved yet.'},
                status=status.HTTP_403_FORBIDDEN
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
            created_by=user
        )
        
        serializer = GuideOfferSerializer(application, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

