from django.urls import path, include
from rest_framework.routers import DefaultRouter

# Views
from .views.authentication import ProtectedTestView, LogoutView
from .views.views import (
    api_root,
    TouristRegistrationAPI,
    GuideRegistrationAPI,
    AgencyRegistrationAPI,
    AgencyOperatorRegistrationAPI,
    MinistryAdminRegistrationAPI,
)

from .views.auth import LoginAPIView
from .views.agency_views import AgencyToursView, AgencyOperatorsView, AgencyProfileView

from rest_framework_simplejwt.views import TokenRefreshView
from .views.password import PasswordResetRequestView, PasswordResetConfirmView
from .views.verification import (
    VerificationSubmissionView,
    VerificationListView,
    VerificationDetailView,
    CreateAllVerifications,
)
from .views.permissions_view import PermissionManagementViewSet
from .views.language import LanguageViewSet
from .views.VerifyTokenAPI import VerifyTokenAPI
from .views.platform_views import (
    PlatformStatsView,
    PlatformActivityView,
    PlatformHealthCheckView,
    PlatformReportsView,
)

# ✅ Import all profile views
from .views.profiles import (
    TouristProfileView, 
    GuideProfileView, 
    AgencyAdminProfileView,
    AgencyOperatorProfileView,
    MinistryAdminProfileView,
    AgencyProfileView,
    AvailableGuidesAPI,
    MinistryGuidesAPI,
    MinistryAgenciesAPI
)

# Router setup
router = DefaultRouter()
router.register(r'permissions', PermissionManagementViewSet, basename='permissions')
router.register(r'languages', LanguageViewSet, basename='language')

# URL patterns
urlpatterns = [
    path('', api_root, name='api-root'),

    # Registration
    path('api/register/tourist/', TouristRegistrationAPI.as_view(), name='tourist-register'),
    path('api/register/guide/', GuideRegistrationAPI.as_view(), name='guide-register'),
    path('api/register/agency/', AgencyRegistrationAPI.as_view(), name='agency-register'),
    path('api/register/operator/<uuid:agency_id>/', AgencyOperatorRegistrationAPI.as_view(), name='agencyOperator-register'),
    path('api/register/minestry/', MinistryAdminRegistrationAPI.as_view(), name='minestry-register'),

    # Login
    path('api/auth/login/', LoginAPIView.as_view(), name='login'),

    # Authentication
    path('api/protected-test/', ProtectedTestView.as_view(), name='protected-test'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/logout/', LogoutView.as_view(), name='logout'),

    # Password reset
    path('api/password/reset/', PasswordResetRequestView.as_view(), name='password_reset'),
    path('api/password/reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),

    # Verification (guide)
    path('api/verification/submit/', VerificationSubmissionView.as_view(), name='verification-submit'),
    path('api/verification/requests/', VerificationListView.as_view(), name='verification-list'),
    path('api/verification/requests/<uuid:request_id>/', VerificationDetailView.as_view(), name='verification-detail'),
    path('api/auth/verify/', VerifyTokenAPI.as_view(), name='verify-token'),

    # Dashboards — Profile endpoints
    path('api/tourist/profile/', TouristProfileView.as_view(), name='tourist-profile'),
    path('api/guide/profile/', GuideProfileView.as_view(), name='guide-profile'),
    path('api/agency-admin/profile/', AgencyAdminProfileView.as_view(), name='agency-admin-profile'),
    path('api/agency-operator/profile/', AgencyOperatorProfileView.as_view(), name='agency-operator-profile'),
    path('api/ministry/profile/', MinistryAdminProfileView.as_view(), name='ministry-profile'),
    path('api/agency/profile/', AgencyProfileView.as_view(), name='agency-profile'),

    # Agency endpoints
    path('api/agency/tours/', AgencyToursView.as_view(), name='agency-tours'),
    path('api/agency/operators/', AgencyOperatorsView.as_view(), name='agency-operators'),

    path('api/guide/profiles/', AvailableGuidesAPI.as_view(), name='available-guides'),
    path('api/ministry/guides/', MinistryGuidesAPI.as_view(), name='ministry-guides'),
    path('api/ministry/agencies/', MinistryAgenciesAPI.as_view(), name='ministry-agencies'),
    path('api/verification/create-all/', CreateAllVerifications.as_view(), name='create-all-verifications'),

    # Platform Admin endpoints
    path('api/platform/stats/',       PlatformStatsView.as_view(),       name='platform-stats'),
    path('api/platform/activity/',    PlatformActivityView.as_view(),    name='platform-activity'),
    path('api/platform/healthcheck/', PlatformHealthCheckView.as_view(), name='platform-healthcheck'),
    path('api/platform/reports/',     PlatformReportsView.as_view(),     name='platform-reports'),

    # Router endpoints
    path('api/', include(router.urls)),
]
