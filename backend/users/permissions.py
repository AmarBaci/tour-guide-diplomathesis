from rest_framework.permissions import BasePermission, DjangoModelPermissions
from django.contrib.contenttypes.models import ContentType
from django.db.utils import OperationalError, ProgrammingError  # Fix for undefined errors

# === Role-Based Access Control ===
class IsRole(BasePermission):
    roles = []
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type in self.roles

class IsTourist(IsRole):
    roles = ['tourist']

class IsGuide(IsRole):
    roles = ['guide']

class IsAgencyStaff(IsRole):
    roles = ['agency_admin', 'agency_operator']

class IsAgencyAdmin(IsRole):
    roles = ['agency_admin']

class IsMinistryAdmin(IsRole):
    roles = ['ministry_admin']

class IsPlatformAdmin(IsRole):
    roles = ['admin']

# === Granular Permission System ===
class CustomModelPermissions(DjangoModelPermissions):
    perms_map = {
        'GET': ['%(app_label)s.view_%(model_name)s'],
        'OPTIONS': [],
        'HEAD': [],
        'POST': ['%(app_label)s.add_%(model_name)s'],
        'PUT': ['%(app_label)s.change_%(model_name)s'],
        'PATCH': ['%(app_label)s.change_%(model_name)s'],
        'DELETE': ['%(app_label)s.delete_%(model_name)s'],
    }

# === Specialized Permission Classes ===
class IsVerifiedGuide(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.user_type == 'guide' and 
            hasattr(request.user, 'guide_profile') and
            request.user.guide_profile.is_approved
        )

class CanManageAgencyContent(BasePermission):
    def has_object_permission(self, request, view, obj):
        # Agency admins have full access
        if request.user.user_type == 'agency_admin':
            return True
            
        # Operators need specific permissions
        if request.user.user_type == 'agency_operator':
            # Check if operator has permissions for this content type
            content_type = ContentType.objects.get_for_model(obj)
            permission_codename = f'{content_type.app_label}.change_{content_type.model}'
            return request.user.agency_operator_profile.permissions.filter(
                codename=permission_codename
            ).exists()
            
        return False

class CanApproveVerifications(BasePermission):
    def has_permission(self, request, view):
        if request.user.user_type != 'ministry_admin':
            return False
            
        # Check if ministry admin has approval permissions
        return request.user.has_perm('users.approve_verificationrequest')

# === Permission Flags (Keep your existing bitwise system) ===
class PermissionLevels:
    VIEW = 1
    CREATE = 2
    EDIT = 4
    DELETE = 8
    MANAGE_USERS = 16
    APPROVE_CONTENT = 32

class RolePermission(BasePermission):
    def __init__(self, required_level=0):
        self.required_level = required_level

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.user.user_type == 'admin':  # optional global override
            return True
        user_level = self.get_user_permission_level(request.user)
        return (user_level & self.required_level) == self.required_level

    @classmethod
    def with_level(cls, level):
        return lambda: cls(required_level=level)

    def get_user_permission_level(self, user):
        PERMISSION_MAP = {
            'tourist': PermissionLevels.VIEW,
            'guide': PermissionLevels.VIEW | PermissionLevels.CREATE | PermissionLevels.EDIT,
            'agency_operator': PermissionLevels.VIEW | PermissionLevels.CREATE | PermissionLevels.EDIT,
            'agency_admin': PermissionLevels.VIEW | PermissionLevels.CREATE | PermissionLevels.EDIT 
                         | PermissionLevels.DELETE | PermissionLevels.MANAGE_USERS,
            'ministry_admin': PermissionLevels.VIEW | PermissionLevels.CREATE | PermissionLevels.EDIT 
                          | PermissionLevels.DELETE | PermissionLevels.APPROVE_CONTENT,
        }
        return PERMISSION_MAP.get(user.user_type, 0)
    
def create_groups_and_permissions():
    try:
        from django.contrib.auth.models import Group, Permission
        from django.contrib.contenttypes.models import ContentType
        from .models import VerificationRequest  # Only include models from users app
            
        # Create ministry approval permissions
        verification_ct = ContentType.objects.get_for_model(VerificationRequest)
        Permission.objects.get_or_create(
            codename='approve_verification',
            name='Can approve verifications',
            content_type=verification_ct
        )
        
        # Create Tour Managers group without permissions
        Group.objects.get_or_create(name='Tour Managers')
        
    except (OperationalError, ProgrammingError):
        # Ignore during initial migrations
        pass
    except ImportError:
        # Handle missing models
        pass

ROLE_PERMISSION_MAP = {
    'tourist': {
        'default': ['view'],
        'models': {
            'tour': ['view'],
            'guide': ['view'],
        }
    },
    'guide': {
        'default': ['view', 'add', 'change'],
        'models': {
            'tour': ['view', 'add', 'change'],
            'availability': ['view', 'add', 'change', 'delete'],
        }
    },
    'agency_operator': {
        'default': ['view', 'add', 'change'],
        'models': {
            'tour': ['view', 'add', 'change'],
            'booking': ['view', 'change'],
        }
    },
    'agency_admin': {
        'default': ['view', 'add', 'change', 'delete'],
        'models': {
            '*': ['view', 'add', 'change', 'delete'],
            'user': ['manage']
        }
    },
    'ministry_admin': {
        'default': ['view', 'add', 'change', 'delete', 'approve'],
        'models': {
            'verificationrequest': ['approve'],
            'guide': ['approve'],
        }
    },
    'admin': {
        'default': ['full_access']
    }
}