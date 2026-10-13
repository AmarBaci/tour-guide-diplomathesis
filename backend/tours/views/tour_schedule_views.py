from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, BasePermission

from ..models import TourSchedule
from ..serializers import TourScheduleSerializer

class IsAgencyMemberOrReadOnly(BasePermission):
    """
    Custom permission to only allow agency members to edit tour schedules.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        
        # Write permissions only for agency admins/operators
        if hasattr(request.user, 'agency_admin_profile'):
            return obj.tour.agency == request.user.agency_admin_profile.agency
        if hasattr(request.user, 'agency_operator_profile'):
            return obj.tour.agency == request.user.agency_operator_profile.agency
        
        return False

class TourScheduleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing tour schedules.
    """
    queryset = TourSchedule.objects.all()
    serializer_class = TourScheduleSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsAgencyMemberOrReadOnly]
    
    def get_queryset(self):
        queryset = TourSchedule.objects.all()
        
        # Filter by tour
        tour_id = self.request.query_params.get('tour', None)
        if tour_id:
            queryset = queryset.filter(tour__id=tour_id)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        
        # Only show schedules for active tours to non-authenticated users
        if not self.request.user.is_authenticated:
            queryset = queryset.filter(tour__is_active=True)
        
        return queryset
    
    def perform_create(self, serializer):
        # Check if the user has permission to create schedules for this tour
        tour = serializer.validated_data['tour']
        
        if hasattr(self.request.user, 'agency_admin_profile'):
            if tour.agency != self.request.user.agency_admin_profile.agency:
                self.permission_denied(self.request)
        elif hasattr(self.request.user, 'agency_operator_profile'):
            if tour.agency != self.request.user.agency_operator_profile.agency:
                self.permission_denied(self.request)
        else:
            self.permission_denied(self.request)
        
        serializer.save()