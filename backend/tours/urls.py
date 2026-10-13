from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TourViewSet, 
    TourImageViewSet, 
    TourScheduleViewSet, 
    BookingViewSet, 
    ReviewViewSet,
    GuideAvailabilityViewSet,
)

from .views.guideOffer_views import GuideOfferViewSet

router = DefaultRouter()
router.register(r'tours', TourViewSet)
router.register(r'tour-images', TourImageViewSet)
router.register(r'tour-schedules', TourScheduleViewSet)
router.register(r'bookings', BookingViewSet, basename='bookings')
router.register(r'reviews', ReviewViewSet, basename='reviews') 
router.register(r'guide-offers', GuideOfferViewSet, basename='guide-offers')
router.register(r'guide-availability', GuideAvailabilityViewSet, basename='guide-availability')


urlpatterns = [
    path('tours/<uuid:pk>/apply/', TourViewSet.as_view({'post': 'apply'}), name='tour-apply'),
    path('tours/<uuid:pk>/assign-guide/', TourViewSet.as_view({'post': 'assign_guide'}), name='tour-assign-guide'),
    path('api/', include(router.urls)),
]
