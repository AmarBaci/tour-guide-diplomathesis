from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny
from ..models import CustomUser, GuideProfile, AgencyAdminProfile

class LoginAPIView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        expected_role = request.data.get('expected_role')  
        
        # Basic validation
        if not email or not password:
            return Response(
                {"error": "Email and password are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Authenticate user
        user = authenticate(request, email=email, password=password)
        
        if not user:
            return Response(
                {"error": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Role validation
        if expected_role and user.user_type != expected_role:
            return Response(
                {"error": f"Invalid account type for {expected_role} login"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Prepare response data
        tokens = self.get_tokens(user)
        response_data = {
            "access": tokens["access"],
            "refresh": tokens["refresh"],
            "email": user.email,
            "user_type": user.user_type,
            "is_verified": user.is_verified,
        }
        
        # Add role-specific status
        if user.user_type == 'guide':
            try:
                response_data["is_approved"] = user.guide_profile.is_approved
            except GuideProfile.DoesNotExist:
                response_data["is_approved"] = False
        
        elif user.user_type == 'agency_admin':
            try:
                response_data["agency_status"] = user.agency_admin_profile.agency.is_active
            except AgencyAdminProfile.DoesNotExist:
                response_data["agency_status"] = False
        
        return Response(response_data, status=status.HTTP_200_OK)
    
    def get_tokens(self, user):
        refresh = RefreshToken.for_user(user)
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }