from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import IntegrityError
from rest_framework.exceptions import PermissionDenied
from ...models import Agency, AgencyAdminProfile
from ...serializers import AgencyOperatorRegistrationSerializer

class AgencyOperatorRegistrationAPI(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, agency_id, *args, **kwargs):
        try:
            agency = Agency.objects.get(id=agency_id)
            if not AgencyAdminProfile.objects.filter(user=request.user, agency=agency).exists():
                raise PermissionDenied("You are not an admin of this agency.")
        except Agency.DoesNotExist:
            return Response({"error": "Agency not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = AgencyOperatorRegistrationSerializer(
            data=request.data,
            context={'agency': agency}
        )
        
        if not serializer.is_valid():
            return Response({
                "message": "Operator registration failed.",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = serializer.save()
            return Response({
                "message": "Operator created successfully.",
                "operator_email": user.email,
                "agency": agency.name
            }, status=status.HTTP_201_CREATED)
        
        except IntegrityError as e:
            return Response({
                "message": "Internal error during registration.",
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)