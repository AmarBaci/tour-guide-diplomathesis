# authentication.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
import logging
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


logger = logging.getLogger(__name__)

class TokenRefreshView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = TokenRefreshSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)
            
        return Response(serializer.validated_data, status=status.HTTP_200_OK)
    
class LogoutView(APIView):
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Successfully logged out.'}, status=status.HTTP_205_RESET_CONTENT)
        except TokenError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class ProtectedTestView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        return Response({
            "message": "Access granted!",
            "user": {
                "email": request.user.email,
                "user_type": request.user.user_type
            }
        })