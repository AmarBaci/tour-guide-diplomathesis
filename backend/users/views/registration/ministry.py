from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db import IntegrityError
from ...serializers import MinistryAdminUserRegistrationSerializer

class MinistryAdminRegistrationAPI(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = MinistryAdminUserRegistrationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                "message": "Ministry Admin registration failed.",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = serializer.save()
            return Response({
                "message": "Ministry Admin registered successfully.",
                "user_id": user.id,
                "email": user.email
            }, status=status.HTTP_201_CREATED)

        except IntegrityError as e:
            return Response({
                "message": "Internal error during registration.",
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)