import uuid
import os
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.core.validators import RegexValidator, validate_email, FileExtensionValidator
from django.core.exceptions import ValidationError
from django.db.models.signals import post_save
from django.dispatch import receiver
from phonenumber_field.modelfields import PhoneNumberField
from .managers import CustomUserManager
from django.core.validators import MinValueValidator, MaxValueValidator, FileExtensionValidator

# --- UTILITY FUNCTIONS ---
def profile_pic_path(instance, filename):
    """Generate path for profile pictures: media/profile_pics/user_type/uuid.ext"""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('profile_pics', instance.user.user_type, filename)

def agency_logo_path(instance, filename):
    """Generate path for agency logos: media/agency_logos/uuid.ext"""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('agency_logos', filename)

# --- BASE MODELS FOR REUSABILITY ---
class BaseProfile(models.Model):
    """Abstract model for common profile fields"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

# --- CORE USER MODEL ---
class CustomUser(AbstractUser):
    USER_TYPE_CHOICES = (
        ('admin', 'System Admin'),
        ('tourist', 'Tourist'),
        ('guide', 'Guide'),
        ('agency_admin', 'Agency Admin'),
        ('agency_operator', 'Agency Operator'),
        ('ministry_admin', 'Ministry Admin'),
    )

    # --- PRIMARY IDENTIFIERS ---
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(
        unique=True,
        validators=[validate_email],
        error_messages={'unique': "A user with this email already exists."}
    )
    
    # --- ROLE MANAGEMENT ---
    user_type = models.CharField(
        max_length=20,
        choices=USER_TYPE_CHOICES,
        default='tourist'
    )
    
    # --- AUTHENTICATION OVERRIDES ---
    username = None
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['user_type']
    
    # --- PERMISSION SYSTEM FIXES ---
    groups = models.ManyToManyField(
        Group,
        verbose_name='groups',
        blank=True,
        related_name='customuser_groups',
        related_query_name='customuser',
    )
    user_permissions = models.ManyToManyField(
        Permission,
        verbose_name='user permissions',
        blank=True,
        related_name='customuser_permissions',
        related_query_name='customuser',
    )

    # --- STATUS TRACKING ---
    is_verified = models.BooleanField(default=False)

    objects = CustomUserManager()

    def get_full_name(self):
        """Return the full name of the user"""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        elif self.first_name:
            return self.first_name
        elif self.last_name:
            return self.last_name
        else:
            # Return the part before @ in email as fallback
            return self.email.split('@')[0]

    def __str__(self):
        return f"{self.email} ({self.user_type})"

# --- ROLE-SPECIFIC PROFILES ---
class TouristProfile(BaseProfile):
    user = models.OneToOneField(
        CustomUser, 
        on_delete=models.CASCADE,
        related_name='tourist_profile'
    )
    full_name = models.CharField(max_length=100)
    nationality = models.CharField(max_length=50)
    phone = PhoneNumberField(region='AL')
    
    # Profile picture field
    profile_picture = models.ImageField(
        upload_to=profile_pic_path,
        null=True,
        blank=True,
        validators=[
            FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png']),
        ]
    )

class Language(models.Model):
    code = models.CharField(max_length=2, unique=True)
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name

def guide_profile_pic_path(instance, filename):
    # file will be uploaded to MEDIA_ROOT/guide_profiles/<id>/<filename>
    return os.path.join('guide_profiles', str(instance.id), filename)

# Update the GuideProfile class
class GuideProfile(BaseProfile):
    user = models.OneToOneField(
        CustomUser, 
        on_delete=models.CASCADE,
        related_name='guide_profile'
    )
    license_no = models.CharField(
        max_length=50,
        unique=True,
        validators=[
            RegexValidator(
                r'^AL-GD-\d{4}$',
                'License must be in format: AL-GD-1234'
            )
        ]
    )
    bio = models.TextField(max_length=500)
    languages = models.ManyToManyField(Language, blank=True) 
    is_approved = models.BooleanField(default=False)
    
    # Profile picture field (keep this)
    profile_picture = models.ImageField(
        upload_to=guide_profile_pic_path,
        null=True,
        blank=True,
        validators=[
            FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png']),
        ]
    )

    # Add these new fields for operator dashboard
    daily_rate = models.DecimalField(
        max_digits=8, 
        decimal_places=2, 
        null=True, 
        blank=True,
        default=100.00,
        help_text="Daily rate in €"
    )
    rating = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(5.0)],
        help_text="Rating from 0 to 5 stars"
    )
    experience = models.CharField(
        max_length=100, 
        blank=True,
        default="",
        help_text="Years of experience or experience description"
    )
    specialties = models.JSONField(
        default=list,
        help_text="List of specialties (e.g., ['Adventure', 'Cultural', 'Historical'])"
    )

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.license_no}"

class Agency(BaseProfile):
    name = models.CharField(max_length=100)
    registration_no = models.CharField(
        max_length=50,
        unique=True,
        validators=[
            RegexValidator(
                r'^AL-AG-\d{4}$',
                'Registration must be in format: AL-AG-1234'
            )
        ]
    )
    ministry_contact = models.ForeignKey(
        'MinistryAdminProfile',
        on_delete=models.PROTECT,
        related_name='managed_agencies'
    )
    is_active = models.BooleanField(default=False)
    
    # Agency logo field
    logo = models.ImageField(
        upload_to=agency_logo_path,
        null=True,
        blank=True,
        validators=[
            FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png']),
        ],
        verbose_name='Agency Logo'
    )

class AgencyAdminProfile(BaseProfile):
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='agency_admin_profile'
    )
    agency = models.ForeignKey(
        Agency,
        on_delete=models.CASCADE,
        related_name='administrators'
    )
    created_at = models.DateTimeField(default=timezone.now)  # Updated here


class AgencyOperatorProfile(BaseProfile):
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='agency_operator_profile'
    )
    agency = models.ForeignKey(
        Agency,
        on_delete=models.CASCADE,
        related_name='operators'
    )
    created_at = models.DateTimeField(default=timezone.now)  # Updated here
    
    permissions = models.ManyToManyField(  # Replace JSON with formal permissions
        Permission,
        limit_choices_to={'content_type__model__in': ['tour', 'booking']},
        blank=True
    )

class MinistryAdminProfile(BaseProfile):
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='ministry_admin_profile'
    )
    department = models.CharField(max_length=100)

# --- VERIFICATION SYSTEM ---
class VerificationRequest(BaseProfile):
    REQUEST_TYPE_CHOICES = (
        ('guide', 'Guide'),
        ('agency', 'Agency')
    )
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected')
    )

    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='verification_requests'
    )
    request_type = models.CharField(max_length=20, choices=REQUEST_TYPE_CHOICES)
    document = models.FileField(upload_to='verification_docs/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    resolved_by = models.ForeignKey(
        MinistryAdminProfile,
        on_delete=models.PROTECT,
        null=True,
        blank=True
    )
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolution_notes = models.TextField(blank=True, null=True)

# --- SIGNALS FOR AUTOMATIC PROFILE CREATION ---
@receiver(post_save, sender=CustomUser)
def create_user_profile(sender, instance, created, **kwargs):
    """Auto-create role-specific profile when user is created.
    
    Tourist and ministry_admin profiles are created automatically here.
    Guide and agency profiles require extra fields supplied by their own
    registration serializers, so they are created there instead.
    """
    if not created:
        return
    if instance.user_type == 'tourist':
        TouristProfile.objects.get_or_create(user=instance)
    elif instance.user_type == 'ministry_admin':
        MinistryAdminProfile.objects.get_or_create(
            user=instance,
            defaults={'department': 'General'}
        )
