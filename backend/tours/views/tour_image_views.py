from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from ..models import TourImage
from ..serializers import TourImageSerializer

class TourImageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing tour images.
    """
    queryset = TourImage.objects.all()
    serializer_class = TourImageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Only show images for tours that the user has access to
        if hasattr(self.request.user, 'agency_admin_profile'):
            agency = self.request.user.agency_admin_profile.agency
            return TourImage.objects.filter(tour__agency=agency)
        elif hasattr(self.request.user, 'agency_operator_profile'):
            agency = self.request.user.agency_operator_profile.agency
            return TourImage.objects.filter(tour__agency=agency)
        else:
            # For other users, only show images for active tours
            return TourImage.objects.filter(tour__is_active=True)
    
    def perform_destroy(self, instance):
        # Only allow deletion if user has permission for the tour
        tour = instance.tour
        if hasattr(self.request.user, 'agency_admin_profile'):
            if tour.agency != self.request.user.agency_admin_profile.agency:
                self.permission_denied(self.request)
        elif hasattr(self.request.user, 'agency_operator_profile'):
            if tour.agency != self.request.user.agency_operator_profile.agency:
                self.permission_denied(self.request)
        else:
            self.permission_denied(self.request)
        
        instance.delete()