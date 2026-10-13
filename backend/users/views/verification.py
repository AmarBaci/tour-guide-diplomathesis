from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser
from users.models import VerificationRequest, GuideProfile
from users.serializers import (
    VerificationRequestSerializer, 
    VerificationResolutionSerializer
)
from users.permissions import IsGuide, IsMinistryAdmin
from django.utils import timezone
from users.models import VerificationRequest, GuideProfile, AgencyAdminProfile, Agency

class GuideVerificationAPI(APIView):
    def get(self, request):
        return Response({'message': 'Guide verification working'})

class VerificationSubmissionView(APIView):
    permission_classes = [IsAuthenticated, IsGuide]
    parser_classes = [MultiPartParser]
    
    def post(self, request):
        serializer = VerificationRequestSerializer(
            data=request.data, 
            context={'request': request}
        )
        if serializer.is_valid():
            # Create verification request
            verification = serializer.save(
                user=request.user,
                request_type='guide'
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerificationListView(APIView):
    permission_classes = [IsAuthenticated, IsMinistryAdmin]

    def get(self, request):
        try:
            requests = VerificationRequest.objects.filter(
                status='pending'
            ).select_related('user')
            serializer = VerificationRequestSerializer(requests, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {"error": "Internal server error", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class VerificationDetailView(APIView):
    permission_classes = [IsAuthenticated, IsMinistryAdmin]
    
    def patch(self, request, request_id):
        try:
            verification = VerificationRequest.objects.get(
                id=request_id, 
                status='pending'
            )
        except VerificationRequest.DoesNotExist:
            return Response(
                {"detail": "Verification request not found or already resolved"},
                status=status.HTTP_404_NOT_FOUND
            )
            
        serializer = VerificationResolutionSerializer(
            data=request.data, 
            instance=verification
        )
        
        if serializer.is_valid():
            # Update verification status
            try:
                ministry_profile = request.user.ministry_admin_profile
            except Exception:
                return Response(
                    {"detail": "Ministry admin profile not found. Please contact a platform administrator."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            verification = serializer.save(
                resolved_by=ministry_profile,
                resolved_at=timezone.now()
            )
            
            # Update guide status if approved
            if verification.status == 'approved':
                if verification.request_type == 'guide':
                    GuideProfile.objects.filter(
                        user=verification.user
                    ).update(is_approved=True)
                elif verification.request_type == 'agency':
                    # Find and activate the agency
                    try:
                        agency_admin_profile = AgencyAdminProfile.objects.get(user=verification.user)
                        agency = agency_admin_profile.agency
                        agency.is_active = True
                        agency.save()
                    except AgencyAdminProfile.DoesNotExist:
                        # If agency admin profile doesn't exist, try to find agency by user
                        try:
                            agency = Agency.objects.get(administrators__user=verification.user)
                            agency.is_active = True
                            agency.save()
                        except Agency.DoesNotExist:
                            pass  # Agency will remain inactive

            return Response(VerificationRequestSerializer(verification).data)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CreateAllVerifications(APIView):
    permission_classes = [IsAuthenticated, IsMinistryAdmin]
    
    def post(self, request):
        from users.models import GuideProfile, AgencyAdminProfile, VerificationRequest
        
        # Create for guides
        for guide in GuideProfile.objects.all():
            if not VerificationRequest.objects.filter(user=guide.user, request_type='guide').exists():
                VerificationRequest.objects.create(
                    user=guide.user,
                    request_type='guide',
                    status='pending'
                )
        
        # Create for agencies
        for admin in AgencyAdminProfile.objects.all():
            if not VerificationRequest.objects.filter(user=admin.user, request_type='agency').exists():
                VerificationRequest.objects.create(
                    user=admin.user,
                    request_type='agency',
                    status='pending'
                )
                
        return Response({"message": "Verification requests created successfully"})