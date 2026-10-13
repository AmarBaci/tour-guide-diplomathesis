from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from ..utils import generate_password_reset_token, validate_password_reset_token
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings

User = get_user_model()

class PasswordResetRequestView(APIView):
    """Step 1: Request password reset email"""
    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email__iexact=email)
            token = generate_password_reset_token(user)
            
            # Send email (console backend for testing)
            send_mail(
                "Reset Your Password",
                f"Use this token to reset your password: {token}",
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
            return Response(
                {"detail": "Reset instructions sent"}, 
                status=status.HTTP_200_OK
            )
        except User.DoesNotExist:
            # Avoid revealing email existence
            return Response(
                {"detail": "If this email exists, reset instructions were sent"},
                status=status.HTTP_200_OK
            )

class PasswordResetConfirmView(APIView):
    """Step 2: Submit token + new password"""
    def post(self, request):
        token = request.data.get('token')
        new_password = request.data.get('password')
        
        try:
            user = validate_password_reset_token(token)
            user.set_password(new_password)
            user.save()
            return Response(
                {"detail": "Password updated successfully"},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )