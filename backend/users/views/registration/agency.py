import logging
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import IntegrityError
from ...serializers import AgencyAdminRegistrationSerializer
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import MultiPartParser, FormParser

logger = logging.getLogger(__name__)

class AgencyRegistrationAPI(APIView):
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        try:
            # Log incoming request data without files
            log_data = request.data.copy()
            if 'registration_document' in log_data:
                log_data['registration_document'] = f"FILE: {log_data['registration_document'].name}"
            
            logger.info(f"Agency registration request data: {log_data}")
            
            # Check for required fields upfront for better error messages
            required_fields = ['email', 'password', 'agency_name', 'registration_no', 'registration_document']
            missing_fields = [field for field in required_fields if field not in request.data]
            
            if missing_fields:
                return Response({
                    "message": "Missing required fields",
                    "errors": {field: ["This field is required"] for field in missing_fields}
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Pass request data directly to serializer
            serializer = AgencyAdminRegistrationSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
            
            logger.info(f"Agency registered successfully: {user.email}")
            
            return Response({
                "message": "Agency registered successfully. Verification pending.",
                "agency_id": user.agency_admin_profile.agency.id,
                "admin_email": user.email
            }, status=status.HTTP_201_CREATED)

        except ValidationError as e:
            logger.warning(f"Validation error: {e.detail}")
            return Response({
                "message": "Registration validation failed",
                "errors": e.detail
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except IntegrityError as e:
            logger.error(f"Database integrity error: {str(e)}")
            
            # Enhanced error extraction
            error_detail = {}
            if 'email' in str(e):
                error_detail['email'] = ["This email is already registered"]
            if 'registration_no' in str(e):
                error_detail['registration_no'] = ["This registration number is already in use"]
            if not error_detail:
                error_detail['non_field_errors'] = ["Database constraint violation"]
                
            return Response({
                "message": "Registration conflict",
                "errors": error_detail
            }, status=status.HTTP_409_CONFLICT)
            
        except Exception as e:
            logger.exception(f"Unexpected error during agency registration: {str(e)}")
            return Response({
                "message": "Internal server error",
                "error": "An unexpected error occurred. Our team has been notified."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)