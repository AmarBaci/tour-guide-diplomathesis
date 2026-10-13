from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import BasePermission
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from ..models import CustomUser, AgencyOperatorProfile
from ..serializers import PermissionSerializer, GroupSerializer
from users.permissions import IsAgencyAdmin, IsPlatformAdmin


class PermissionManagementViewSet(viewsets.ModelViewSet):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [IsAgencyAdmin | IsPlatformAdmin]

    
    @action(detail=False, methods=['get'], url_path='available-permissions')
    def list_available_permissions(self, request):
        """List permissions that can be assigned to operators"""
        content_types = ContentType.objects.filter(
            app_label__in=['tours', 'bookings']  # Replace with your actual app names
        )
        perms = Permission.objects.filter(content_type__in=content_types)
        serializer = PermissionSerializer(perms, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], url_path='update-operator-permissions')
    def update_operator_permissions(self, request, pk=None):
        """Update permissions for an agency operator"""
        try:
            operator = AgencyOperatorProfile.objects.get(pk=pk)
            permission_ids = request.data.get('permissions', [])
            
            # Validate permissions belong to allowed apps
            valid_perms = Permission.objects.filter(
                id__in=permission_ids,
                content_type__app_label__in=['tours', 'bookings']  # Replace with your apps
            )
            
            operator.permissions.set(valid_perms)
            return Response({"status": "Permissions updated"})
        
        except AgencyOperatorProfile.DoesNotExist:
            return Response({"error": "Operator not found"}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['get'], url_path='operator-groups')
    def list_operator_groups(self, request):
        """List available permission groups for operators"""
        groups = Group.objects.filter(name__icontains='operator')
        serializer = GroupSerializer(groups, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], url_path='assign-to-group')
    def assign_operator_to_group(self, request, pk=None):
        """Assign operator to a permission group"""
        try:
            operator = AgencyOperatorProfile.objects.get(pk=pk)
            group_id = request.data.get('group_id')
            group = Group.objects.get(pk=group_id)
            
            operator.user.groups.add(group)
            return Response({"status": f"Added to {group.name} group"})
        
        except (AgencyOperatorProfile.DoesNotExist, Group.DoesNotExist):
            return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)

class IsMinistryAdmin(BasePermission):
    """
    Allows access only to ministry admin users.
    """
    def has_permission(self, request, view):
        return bool(request.user and 
                   request.user.is_authenticated and 
                   hasattr(request.user, 'ministry_admin_profile'))