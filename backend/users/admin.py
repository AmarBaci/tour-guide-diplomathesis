# tours/admin.py
from django.contrib import admin
from .models import CustomUser, TouristProfile, GuideProfile, Agency, AgencyAdminProfile, AgencyOperatorProfile, MinistryAdminProfile, VerificationRequest

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('email', 'user_type', 'is_verified')
    list_filter = ('user_type', 'is_verified')
    search_fields = ('email',)

@admin.register(GuideProfile)
class GuideProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'license_no', 'is_approved', 'rating', 'daily_rate', 'experience')
    list_filter = ('is_approved', 'languages', 'rating')
    search_fields = ('user__email', 'user__first_name', 'user__last_name', 'license_no')
    filter_horizontal = ('languages',)
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        (None, {
            'fields': ('user', 'license_no', 'is_approved')
        }),
        ('Profile Information', {
            'fields': ('bio', 'profile_picture', 'languages')
        }),
        ('Professional Details', {
            'fields': ('daily_rate', 'rating', 'experience', 'specialties')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_readonly_fields(self, request, obj=None):
        if obj:  # editing an existing object
            return ['user', 'license_no', 'created_at', 'updated_at'] + self.readonly_fields
        return self.readonly_fields

# Keep your existing registrations for other models
admin.site.register(TouristProfile)
admin.site.register(Agency)
admin.site.register(AgencyAdminProfile)
admin.site.register(AgencyOperatorProfile)
admin.site.register(MinistryAdminProfile)
admin.site.register(VerificationRequest)