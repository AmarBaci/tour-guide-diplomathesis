from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import IntegrityError
from ...serializers import GuideRegistrationSerializer
from rest_framework.exceptions import ValidationError
import logging
import traceback

logger = logging.getLogger(__name__)

class GuideRegistrationAPI(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        try:
            # Log incoming request data
            logger.info(f"Received guide registration request: {request.data}")
            
            # Handle form-data payload
            data = request.data.dict() if hasattr(request.data, 'dict') else request.data
            logger.info(f"Processed data: {data}")
            
            # Add debug: Check what we're about to send to serializer
            logger.info(f"Data being sent to serializer: {data.keys()}")
            
            serializer = GuideRegistrationSerializer(data=data)
            
            # Add validation debug
            if not serializer.is_valid():
                logger.error(f"Serializer validation errors: {serializer.errors}")
                return Response({
                    "message": "Registration validation failed",
                    "errors": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            logger.info("Serializer is valid, proceeding with save()")
            user = serializer.save()
            
            logger.info(f"Guide registered successfully: {user.email}")
            
            return Response({
                "message": "Guide registered successfully. Your account is pending verification.",
                "user_id": user.id,
                "email": user.email,
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.exception(f"Unexpected error during guide registration: {str(e)}")
            logger.error(f"Full traceback: {traceback.format_exc()}")
            
            return Response({
                "message": "Internal server error",
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)