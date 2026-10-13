from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import IntegrityError
from ...serializers import TouristRegistrationSerializer
from rest_framework.exceptions import ValidationError
import logging

logger = logging.getLogger(__name__)

class TouristRegistrationAPI(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        try:
            # Use request.data directly
            serializer = TouristRegistrationSerializer(data=request.data)
            
            # Validate with exception to get detailed errors
            serializer.is_valid(raise_exception=True)
            
            # Create user and profile
            user = serializer.save()
            
            return Response({
                "message": "Tourist registered successfully!",
                "user_id": user.id,
                "email": user.email,
            }, status=status.HTTP_201_CREATED)

        except ValidationError as e:
            logger.warning(f"Validation error: {e.detail}")
            return Response({
                "message": "Registration failed. Please check the errors.",
                "errors": e.detail
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except IntegrityError as e:
            logger.error(f"Integrity error: {str(e)}")
            
            # Handle specific constraint violations
            if 'email' in str(e):
                return Response({
                    "message": "Registration failed",
                    "errors": {"email": "This email is already registered"}
                }, status=status.HTTP_400_BAD_REQUEST)
                
            # Handle tourist profile unique constraint
            if 'tourist_profile_user_id_key' in str(e):
                return Response({
                    "message": "Registration failed",
                    "errors": {"profile": "User profile already exists"}
                }, status=status.HTTP_400_BAD_REQUEST)
                
            return Response({
                "message": "Database error occurred",
                "error": "Please try again later"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        except Exception as e:
            logger.exception(f"Unexpected error: {str(e)}")
            return Response({
                "message": "Internal server error",
                "error": "An unexpected error occurred"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)