from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from tours.models import Tour
from tours.serializers import TourSerializer
from users.models import AgencyOperatorProfile, Agency, AgencyAdminProfile
from users.serializers import AgencyOperatorProfileSerializer, AgencySerializer
from rest_framework.exceptions import PermissionDenied

class IsAgencyMember(IsAuthenticated):
    """
    Permission to check if user is an agency admin or operator
    """
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
            
        return (hasattr(request.user, 'agency_admin_profile') or 
                hasattr(request.user, 'agency_operator_profile'))

class AgencyToursView(APIView):
    permission_classes = [IsAgencyMember]
    
    def get(self, request):
        # Get the agency from the user
        if hasattr(request.user, 'agency_admin_profile'):
            agency = request.user.agency_admin_profile.agency
        else:
            agency = request.user.agency_operator_profile.agency
        
        # Get tours for this agency
        tours = Tour.objects.filter(agency=agency)
        serializer = TourSerializer(tours, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        """
        Create a new tour for the agency of the logged-in user
        """
        # Get the agency from the user
        if hasattr(request.user, 'agency_admin_profile'):
            agency = request.user.agency_admin_profile.agency
        else:
            agency = request.user.agency_operator_profile.agency
        
        # Prepare the data with the agency included
        data = request.data.copy()
        data['agency'] = agency.id
        
        # Use the TourSerializer to validate and create the tour
        serializer = TourSerializer(data=data, context={'request': request})
        
        if serializer.is_valid():
            tour = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AgencyOperatorsView(APIView):
    permission_classes = [IsAgencyMember]
    
    def get(self, request):
        if not hasattr(request.user, 'agency_admin_profile'):
            return Response({"error": "Only agency admins can view operators"}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        agency = request.user.agency_admin_profile.agency
        
        operators = AgencyOperatorProfile.objects.filter(agency=agency)
        serializer = AgencyOperatorProfileSerializer(operators, many=True)
        return Response(serializer.data)

class AgencyProfileView(APIView):
    permission_classes = [IsAgencyMember]
    
    def get(self, request):
        if hasattr(request.user, 'agency_admin_profile'):
            agency = request.user.agency_admin_profile.agency
        else:
            agency = request.user.agency_operator_profile.agency
        
        serializer = AgencySerializer(agency)
        return Response(serializer.data)
    
    def patch(self, request):
        if not hasattr(request.user, 'agency_admin_profile'):
            return Response({"error": "Only agency admins can update agency profile"}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        agency = request.user.agency_admin_profile.agency
        serializer = AgencySerializer(agency, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)