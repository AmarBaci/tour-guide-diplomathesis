from django.apps import AppConfig

class UsersConfig(AppConfig):
    name = 'users'
    verbose_name = 'User Management'
    
    def ready(self):
        # Initialize permissions after app is fully loaded
        from . import permissions
        permissions.create_groups_and_permissions()