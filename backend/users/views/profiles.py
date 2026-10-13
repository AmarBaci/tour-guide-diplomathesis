from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from ..models import (
    TouristProfile, GuideProfile, AgencyAdminProfile, 
    AgencyOperatorProfile, MinistryAdminProfile, Agency
)
from ..serializers import (
    TouristProfileSerializer, GuideProfileSerializer, 
    AgencyAdminProfileSerializer, AgencyOperatorProfileSerializer,
    MinistryAdminProfileSerializer, AgencySerializer
)

from ..permissions import IsMinistryAdmin

class TouristProfileView(APIView):
    """
    View to retrieve and update the current tourist's own profile.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, 'tourist_profile'):
            return Response({"error": "User is not a tourist."}, status=status.HTTP_403_FORBIDDEN)
        
        profile = request.user.tourist_profile
        serializer = TouristProfileSerializer(profile)
        return Response(serializer.data)

    def patch(self, request):
        if not hasattr(request.user, 'tourist_profile'):
            return Response({"error": "User is not a tourist."}, status=status.HTTP_403_FORBIDDEN)
        
        profile = request.user.tourist_profile
        serializer = TouristProfileSerializer(profile, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GuideProfileView(APIView):
    """
    View to retrieve and update the current guide's own profile.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, 'guide_profile'):
            return Response({"error": "User is not a guide."}, status=status.HTTP_403_FORBIDDEN)
        
        profile = request.user.guide_profile
        serializer = GuideProfileSerializer(profile)
        return Response(serializer.data)

    def patch(self, request):
        if not hasattr(request.user, 'guide_profile'):
            return Response({"error": "User is not a guide."}, status=status.HTTP_403_FORBIDDEN)
        
        profile = request.user.guide_profile
        serializer = GuideProfileSerializer(profile, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AgencyAdminProfileView(APIView):
    """
    View to retrieve and update the current agency admin's own profile.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, 'agency_admin_profile'):
            return Response({"error": "User is not an agency admin."}, status=status.HTTP_403_FORBIDDEN)
        
        profile = request.user.agency_admin_profile
        serializer = AgencyAdminProfileSerializer(profile)
        return Response(serializer.data)

    def patch(self, request):
        if not hasattr(request.user, 'agency_admin_profile'):
            return Response({"error": "User is not an agency admin."}, status=status.HTTP_403_FORBIDDEN)
        
        profile = request.user.agency_admin_profile
        serializer = AgencyAdminProfileSerializer(profile, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AgencyOperatorProfileView(APIView):
    """
    View to retrieve and update the current agency operator's own profile.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, 'agency_operator_profile'):
            return Response({"error": "User is not an agency operator."}, status=status.HTTP_403_FORBIDDEN)
        
        profile = request.user.agency_operator_profile
        serializer = AgencyOperatorProfileSerializer(profile)
        return Response(serializer.data)

    def patch(self, request):
        if not hasattr(request.user, 'agency_operator_profile'):
            return Response({"error": "User is not an agency operator."}, status=status.HTTP_403_FORBIDDEN)
        
        profile = request.user.agency_operator_profile
        serializer = AgencyOperatorProfileSerializer(profile, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MinistryAdminProfileView(APIView):
    """
    View to retrieve and update the current ministry admin's own profile.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, 'ministry_admin_profile'):
            return Response({"error": "User is not a ministry admin."}, status=status.HTTP_403_FORBIDDEN)
        
        profile = request.user.ministry_admin_profile
        serializer = MinistryAdminProfileSerializer(profile)
        return Response(serializer.data)

    def patch(self, request):
        if not hasattr(request.user, 'ministry_admin_profile'):
            return Response({"error": "User is not a ministry admin."}, status=status.HTTP_403_FORBIDDEN)
        
        profile = request.user.ministry_admin_profile
        serializer = MinistryAdminProfileSerializer(profile, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AgencyProfileView(APIView):
    """
    Specialized view for agency-related profile operations
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, 'agency_admin_profile') and not hasattr(request.user, 'agency_operator_profile'):
            return Response(
                {"error": "User is not associated with an agency"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        if hasattr(request.user, 'agency_admin_profile'):
            agency = request.user.agency_admin_profile.agency
        else:
            agency = request.user.agency_operator_profile.agency
        
        serializer = AgencySerializer(agency)
        return Response(serializer.data)

    def patch(self, request):
        if not hasattr(request.user, 'agency_admin_profile'):
            return Response(
                {"error": "Only agency administrators can update agency information"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        agency = request.user.agency_admin_profile.agency
        serializer = AgencySerializer(agency, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Example for the AvailableGuidesAPI view
class AvailableGuidesAPI(APIView):
    """
    API to get all approved guides for operators AND ministry admins to browse
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, 'agency_admin_profile') and \
               not (hasattr(request.user, 'agency_operator_profile')) and \
               not (hasattr(request.user, 'ministry_admin_profile')):
            return Response({"error": "Only agency staff or ministry admins can access this resource."}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        # Get all approved guides with user data preloaded
        guides = GuideProfile.objects.filter(is_approved=True).select_related('user').prefetch_related('languages')
        
        # Apply filters if provided
        specialty = request.query_params.get('specialty')
        if specialty:
            guides = guides.filter(specialties__contains=[specialty])
        
        language = request.query_params.get('language')
        if language:
            guides = guides.filter(languages__name__icontains=language)
        
        min_rating = request.query_params.get('min_rating')
        if min_rating:
            try:
                min_rating = float(min_rating)
                guides = guides.filter(rating__gte=min_rating)
            except ValueError:
                pass
        
        max_daily_rate = request.query_params.get('max_daily_rate')
        if max_daily_rate:
            try:
                max_daily_rate = float(max_daily_rate)
                guides = guides.filter(daily_rate__lte=max_daily_rate)
            except ValueError:
                pass
        
        # Remove duplicates
        guides = guides.distinct()
        
        serializer = GuideProfileSerializer(guides, many=True)
        return Response(serializer.data)

class MinistryGuidesAPI(APIView):
    permission_classes = [IsAuthenticated, IsMinistryAdmin]
    
    def get(self, request):
        guides = GuideProfile.objects.all().select_related('user')
        
        print(f"MinistryGuidesAPI: Returning {guides.count()} guides")
        for guide in guides:
            print(f"Guide: {guide.user.email}, Approved: {guide.is_approved}")
        
        serializer = GuideProfileSerializer(guides, many=True)
        return Response(serializer.data)

class MinistryAgenciesAPI(APIView):
    permission_classes = [IsAuthenticated, IsMinistryAdmin]
    
    def get(self, request):
        agencies = Agency.objects.all().prefetch_related('administrators__user')
        
        # Create a proper response structure
        agency_data = []
        for agency in agencies:
            admin = agency.administrators.first()
            agency_data.append({
                'id': agency.id,
                'name': agency.name,
                'registration_no': agency.registration_no,
                'is_active': agency.is_active,
                'admin_email': admin.user.email if admin else 'Unknown',
                'admin_name': admin.user.get_full_name() if admin else 'Unknown',
                'created_at': agency.created_at
            })
        
        return Response(agency_data)