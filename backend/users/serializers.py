# serializers.py
from rest_framework import serializers
from django.contrib.auth.models import Group
from .models import (
    CustomUser,
    TouristProfile,
    GuideProfile,
    Agency,
    AgencyAdminProfile,
    AgencyOperatorProfile,
    MinistryAdminProfile,
    Language,
    VerificationRequest  
)
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import Permission, Group
from django.core.exceptions import ObjectDoesNotExist
from django.db import transaction
from django.utils import timezone
import re
import os

# --------------------------
# Tourists Registration
# --------------------------
class TouristRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    full_name = serializers.CharField(write_only=True)
    nationality = serializers.CharField(write_only=True)
    phone = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['email', 'password', 'full_name', 'nationality', 'phone']
    
    def validate_phone(self, value):
        if not value.startswith('+355'):
            raise serializers.ValidationError("Phone number must start with +355 for Albania")
        return value

    def create(self, validated_data):
        # Extract tourist-specific fields
        full_name = validated_data.pop('full_name')
        nationality = validated_data.pop('nationality')
        phone = validated_data.pop('phone')

        with transaction.atomic():
            # Create user first
            user = CustomUser.objects.create_user(
                email=validated_data['email'],
                password=validated_data['password'],
                user_type='tourist'
            )
            
            # Check if profile exists before trying to update
            if hasattr(user, 'tourist_profile'):
                profile = user.tourist_profile
            else:
                # Create new profile if not exists
                profile = TouristProfile(user=user)
            
            # Update profile fields
            profile.full_name = full_name
            profile.nationality = nationality
            profile.phone = phone
            profile.save()

        return user
# --------------------------
# Guides Registration
# --------------------------
class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = ['id', 'code', 'name']

class GuideRegistrationSerializer(serializers.ModelSerializer):
    # Change EmailField to CharField and add custom validation
    email = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    license_no = serializers.CharField(required=True)
    bio = serializers.CharField(required=True)
    language_ids = serializers.ListField(
        child=serializers.UUIDField(),
        required=False,
        default=list
    )
    
    # New fields with defaults
    daily_rate = serializers.DecimalField(
        max_digits=8, 
        decimal_places=2, 
        required=False, 
        default=100.00
    )
    rating = serializers.FloatField(
        required=False, 
        default=0.0,
        min_value=0.0,
        max_value=5.0
    )
    experience = serializers.CharField(
        required=False, 
        default="",
        allow_blank=True
    )
    specialties = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        default=list
    )

    class Meta:
        model = CustomUser
        fields = ('email', 'password', 'first_name', 'last_name', 
                 'license_no', 'bio', 'language_ids',
                 'daily_rate', 'rating', 'experience', 'specialties')

    def validate_email(self, value):
        """Custom email validation that's more flexible with form-data"""
        # Strip any whitespace
        value = value.strip()
        
        # Simple email validation
        if '@' not in value or '.' not in value:
            raise serializers.ValidationError("Enter a valid email address.")
        
        # Check for common issues with form-data
        if value.startswith('"') and value.endswith('"'):
            value = value[1:-1]  # Remove quotes if present
        
        return value

    def validate_license_no(self, value):
        if not value.startswith('AL-GD-'):
            raise serializers.ValidationError("License must start with 'AL-GD-'")
        return value

    def create(self, validated_data):
        # Extract guide-specific data
        license_no = validated_data.pop('license_no')
        bio = validated_data.pop('bio')
        language_ids = validated_data.pop('language_ids', [])
        
        # Extract new fields
        daily_rate = validated_data.pop('daily_rate', 100.00)
        rating = validated_data.pop('rating', 0.0)
        experience = validated_data.pop('experience', '')
        specialties = validated_data.pop('specialties', [])
        
        # Create user
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            user_type='guide'
        )
        
        # Create guide profile with all fields
        guide_profile = GuideProfile.objects.create(
            user=user,
            license_no=license_no,
            bio=bio,
            daily_rate=daily_rate,
            rating=rating,
            experience=experience,
            specialties=specialties
        )
        
        # Add languages
        for language_id in language_ids:
            try:
                language = Language.objects.get(id=language_id)
                guide_profile.languages.add(language)
            except Language.DoesNotExist:
                # Skip invalid language IDs
                continue

        VerificationRequest.objects.create(
            user=user,
            request_type='guide',
            status='pending'
        )
        
        return user

# --------------------------
# Agencies (Admins) Registration
# --------------------------
class AgencySerializer(serializers.ModelSerializer):
    ministry_contact = serializers.PrimaryKeyRelatedField(
        queryset=MinistryAdminProfile.objects.all(),
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = Agency
        fields = ['id', 'name', 'registration_no', 'logo', 'is_active', 'ministry_contact']
        read_only_fields = ['id']
        extra_kwargs = {
            'registration_no': {'validators': []},
            'logo': {'required': False},
        }

class AgencyAdminRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    agency_name = serializers.CharField(write_only=True)
    registration_no = serializers.CharField(write_only=True)
    registration_document = serializers.FileField(write_only=True, required=True)

    class Meta:
        model = CustomUser
        fields = ['email', 'password', 'agency_name', 'registration_no', 'registration_document']
    
    def validate_registration_no(self, value):
        if not re.match(r'^AL-AG-\d{4}$', value):
            raise serializers.ValidationError('Registration must be in format: AL-AG-1234')
        return value

    def create(self, validated_data):
        agency_name = validated_data.pop('agency_name')
        registration_no = validated_data.pop('registration_no')
        registration_document = validated_data.pop('registration_document')
        
        with transaction.atomic():
            # Get or create ministry admin
            ministry_admin = MinistryAdminProfile.objects.first()
            if not ministry_admin:
                # Create fallback ministry admin
                ministry_user = CustomUser.objects.create_user(
                    email='fallback@tourism.al',
                    password=os.getenv('FALLBACK_ADMIN_PWD', 'temp_password'),
                    user_type='ministry_admin'
                )
                ministry_admin = MinistryAdminProfile.objects.create(
                    user=ministry_user,
                    department='Automated Verification'
                )
            
            # Create agency
            agency = Agency.objects.create(
                name=agency_name,
                registration_no=registration_no,
                ministry_contact=ministry_admin,
                is_active=False
            )
            
            # Create admin user
            user = CustomUser.objects.create_user(
                email=validated_data['email'],
                password=validated_data['password'],
                user_type='agency_admin'
            )
            
            # Create agency admin profile
            AgencyAdminProfile.objects.create(
                user=user,
                agency=agency,
                created_at=timezone.now()
            )
            
            # Create verification request
            VerificationRequest.objects.create(
                user=user,
                request_type='agency',
                document=registration_document,
                status='pending'
            )
            
        return user
    
# --------------------------
# Agency Operators Registration
# --------------------------
class AgencyOperatorRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['email', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        agency = self.context['agency']
        
        # Create the user with the specific type
        user = CustomUser.objects.create_user(
            user_type='agency_operator',
            **validated_data
        )
        
        # Create the operator profile
        AgencyOperatorProfile.objects.create(
            user=user, 
            agency=agency
        )
        
        return user

# --------------------------
# Ministry Admin Registration
# --------------------------
class MinistryAdminUserRegistrationSerializer(serializers.ModelSerializer):
    department = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['email', 'password', 'department']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        department = validated_data.pop('department')
        with transaction.atomic():
            user = CustomUser.objects.create_user(
                email=validated_data['email'],
                password=validated_data['password'],
                user_type='ministry_admin'
            )
            # Create the profile explicitly — the post_save signal no longer
            # auto-creates ministry_admin profiles to avoid conflicts.
            MinistryAdminProfile.objects.create(
                user=user,
                department=department
            )
        return user

# --------------------------
# Account Login
# --------------------------
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    expected_role = serializers.CharField(required=False)
    
    def validate(self, attrs):
        email = attrs['email'].lower().strip()
        password = attrs['password']
        expected_role = attrs.get('expected_role')
        
        user = authenticate(email=email, password=password)
        
        if not user:
            raise serializers.ValidationError("Invalid credentials")
            
        if not user.is_active:
            raise serializers.ValidationError("Account disabled")
            
        if expected_role and user.user_type != expected_role:
            raise serializers.ValidationError(
                f"Invalid account type for this login portal. Expected {expected_role}"
            )
            
        refresh = RefreshToken.for_user(user)
        access_exp = refresh.access_token.payload['exp']
        refresh_exp = refresh.payload['exp']
        
        # Build user data with names
        user_data = {
            'id': user.id,
            'email': user.email,
            'user_type': user.user_type,
            'is_verified': user.is_verified,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'full_name': user.get_full_name(),
        }
        
        # Add role-specific statuses
        try:
            if user.user_type == 'guide':
                user_data['is_approved'] = user.guide_profile.is_approved
            elif user.user_type == 'agency_admin':
                user_data['agency_status'] = user.agency_admin_profile.agency.is_active
        except ObjectDoesNotExist:
            pass
            
        response_data = {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'access_exp': access_exp,
            'refresh_exp': refresh_exp,
            'user': user_data
        }
            
        return response_data

# --------------------------
# Verification System
# --------------------------
class VerificationRequestSerializer(serializers.ModelSerializer):
    # Add detailed user information
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_first_name = serializers.CharField(source='user.first_name', read_only=True)
    user_last_name = serializers.CharField(source='user.last_name', read_only=True)
    user_type = serializers.CharField(source='user.user_type', read_only=True)
    
    # Add agency/guide specific information
    agency_name = serializers.SerializerMethodField()
    guide_license = serializers.SerializerMethodField()
    
    class Meta:
        model = VerificationRequest
        fields = [
            'id', 'request_type', 'document', 'status', 'resolved_by', 'resolved_at',
            'user_email', 'user_first_name', 'user_last_name', 'user_type', 'created_at',
            'agency_name', 'guide_license'
        ]
        read_only_fields = ['status', 'resolved_by', 'resolved_at']
    
    def get_agency_name(self, obj):
        if obj.request_type == 'agency':
            try:
                agency_profile = AgencyAdminProfile.objects.get(user=obj.user)
                return agency_profile.agency.name
            except AgencyAdminProfile.DoesNotExist:
                return "Unknown Agency"
        return None
    
    def get_guide_license(self, obj):
        if obj.request_type == 'guide':
            try:
                guide_profile = GuideProfile.objects.get(user=obj.user)
                return guide_profile.license_no
            except GuideProfile.DoesNotExist:
                return "Unknown License"
        return None

class VerificationResolutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = VerificationRequest
        fields = ['status', 'resolution_notes']
        
    def validate_status(self, value):
        if value not in ['approved', 'rejected']:
            raise serializers.ValidationError("Invalid status. Use 'approved' or 'rejected'")
        return value

# --------------------------
# Permissions
# --------------------------
class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ['id', 'name', 'codename', 'content_type']
        
class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name']

class OperatorPermissionUpdateSerializer(serializers.Serializer):
    permissions = serializers.ListField(
        child=serializers.IntegerField(),
        required=True
    )

class GroupAssignmentSerializer(serializers.Serializer):
    group_id = serializers.IntegerField(required=True)

# --------------------------
# Verification Status Check
# --------------------------
class VerificationStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = VerificationRequest
        fields = ['id', 'request_type', 'status', 'resolved_at']
        read_only_fields = fields

# --------------------------
# Tourist Profile
# --------------------------
class TouristProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = TouristProfile
        fields = ['id', 'full_name', 'nationality', 'phone', 'email', 'first_name', 'last_name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

# --------------------------
# Guide Profile
# --------------------------
class GuideProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    languages = serializers.SerializerMethodField()
    language_ids = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Language.objects.all(), 
        source='languages',
        write_only=True,
        required=False
    )
    
    class Meta:
        model = GuideProfile
        fields = [
            'id', 'license_no', 'bio', 'languages', 'language_ids', 
            'is_approved', 'email', 'first_name', 'last_name', 'full_name',
            'created_at', 'updated_at', 'profile_picture', 'daily_rate', 
            'rating', 'experience', 'specialties'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_languages(self, obj):
        return [language.name for language in obj.languages.all()]

# --------------------------
# Agency Admin Profile
# --------------------------
class AgencyAdminProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    agency = AgencySerializer(read_only=True)
    agency_id = serializers.PrimaryKeyRelatedField(
        queryset=Agency.objects.all(), 
        source='agency',
        write_only=True,
        required=False
    )
    
    class Meta:
        model = AgencyAdminProfile
        fields = ['id', 'agency', 'agency_id', 'email', 'first_name', 'last_name', 'full_name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

# --------------------------
# Agency Operator Profile
# --------------------------
class AgencyOperatorProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    agency = AgencySerializer(read_only=True)
    agency_id = serializers.PrimaryKeyRelatedField(
        queryset=Agency.objects.all(), 
        source='agency',
        write_only=True,
        required=False
    )
    
    class Meta:
        model = AgencyOperatorProfile
        fields = ['id', 'agency', 'agency_id', 'email', 'first_name', 'last_name', 'full_name', 'permissions', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

# --------------------------
# Ministry Admin Profile
# --------------------------
class MinistryAdminProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = MinistryAdminProfile
        fields = ['id', 'department', 'email', 'first_name', 'last_name', 'full_name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']