from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from ..models import GuideAvailability
from ..serializers import GuideAvailabilitySerializer


class GuideAvailabilityViewSet(viewsets.ModelViewSet):
    """
    CRUD for a guide's own availability.
    GET  /api/guide-availability/          → list my availability entries
    POST /api/guide-availability/          → create (or bulk-upsert) an entry
    PUT/PATCH /api/guide-availability/{id}/  → update
    DELETE    /api/guide-availability/{id}/  → delete
    """
    serializer_class = GuideAvailabilitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, 'guide_profile'):
            return GuideAvailability.objects.none()
        return GuideAvailability.objects.filter(guide=user.guide_profile)

    def perform_create(self, serializer):
        user = self.request.user
        if not hasattr(user, 'guide_profile'):
            raise PermissionDenied("Only guides can manage availability.")
        # Upsert: update if the entry for that date already exists
        date = serializer.validated_data.get('date')
        obj, created = GuideAvailability.objects.update_or_create(
            guide=user.guide_profile,
            date=date,
            defaults={'is_available': serializer.validated_data.get('is_available', True)}
        )
        # Overwrite the instance so the response contains the saved object
        serializer.instance = obj

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_200_OK, headers=headers)
