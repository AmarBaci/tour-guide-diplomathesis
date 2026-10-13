from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, BasePermission
from django.db.models import Q

from ..models import Review
from ..serializers import ReviewSerializer


class IsReviewOwnerOrAgencyMember(BasePermission):
    """
    Custom permission to only allow:
    - Review owners to edit their own reviews
    - Agency members to moderate reviews for their tours
    """
    def has_object_permission(self, request, view, obj):
        # Users can always access their own reviews
        if obj.user == request.user:
            return True
        
        # Agency members can access reviews for their tours
        if hasattr(request.user, 'agency_admin_profile'):
            return obj.tour.agency == request.user.agency_admin_profile.agency
        if hasattr(request.user, 'agency_operator_profile'):
            return obj.tour.agency == request.user.agency_operator_profile.agency
        
        # Platform admins can access all reviews
        if request.user.user_type == 'admin':
            return True
            
        return False


class ReviewViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing reviews.
    """
    queryset = Review.objects.all()  # Required for DRF router
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated, IsReviewOwnerOrAgencyMember]
    
    def get_queryset(self):
        queryset = super().get_queryset()  # starts from the base queryset
        
        # Filter by tour
        tour_id = self.request.query_params.get('tour')
        if tour_id:
            queryset = queryset.filter(tour__id=tour_id)
        
        # Filter by user
        user_id = self.request.query_params.get('user')
        if user_id:
            queryset = queryset.filter(user__id=user_id)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # For regular users, only show approved reviews or their own reviews
        if not (hasattr(self.request.user, 'agency_admin_profile') or 
                hasattr(self.request.user, 'agency_operator_profile') or
                self.request.user.user_type == 'admin'):
            queryset = queryset.filter(
                Q(status='approved') | 
                Q(user=self.request.user)
            )
        
        return queryset

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a review (for agency members)"""
        review = self.get_object()
        review.status = 'approved'
        review.save()
        return Response({'status': 'review approved'}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject a review (for agency members)"""
        review = self.get_object()
        review.status = 'rejected'
        review.save()
        return Response({'status': 'review rejected'}, status=status.HTTP_200_OK)
