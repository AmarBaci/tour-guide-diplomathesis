from rest_framework_simplejwt.tokens import RefreshToken
from itsdangerous import URLSafeTimedSerializer
from django.conf import settings
from django.core.exceptions import ValidationError
from .models import CustomUser

def create_jwt_token(user):
    """Create JWT token pair with custom claims"""
    refresh = RefreshToken.for_user(user)
    access = refresh.access_token
    
    # Add custom claims to both tokens
    access['user_type'] = user.user_type
    access['email'] = user.email
    refresh['user_type'] = user.user_type
    
    return {
        'access': str(access),
        'refresh': str(refresh)
    }
    
def generate_password_reset_token(user):
    serializer = URLSafeTimedSerializer(settings.SECRET_KEY)
    return serializer.dumps(user.email, salt='password-reset')

def validate_password_reset_token(token, max_age=3600):
    serializer = URLSafeTimedSerializer(settings.SECRET_KEY)
    try:
        email = serializer.loads(
            token,
            salt='password-reset',
            max_age=max_age
        )
        return CustomUser.objects.get(email=email)
    except Exception as e:
        raise ValidationError("Invalid or expired token")