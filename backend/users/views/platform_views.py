from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import connection
from django.db.models import Count
from django.utils import timezone
from datetime import timedelta

from ..models import CustomUser, VerificationRequest
from ..permissions import IsPlatformAdmin
from tours.models import Tour, Booking, Review


class PlatformStatsView(APIView):
    """
    GET /api/platform/stats/
    Returns system-wide counts for the Platform Admin dashboard header cards.
    """
    permission_classes = [IsPlatformAdmin]

    def get(self, request):
        total_users       = CustomUser.objects.count()
        active_tours      = Tour.objects.filter(is_active=True).count()
        total_bookings    = Booking.objects.count()
        pending_verifications = VerificationRequest.objects.filter(status='pending').count()

        # Simple DB liveness check for the status card
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            system_status = "healthy"
        except Exception:
            system_status = "degraded"

        return Response({
            "totalUsers":            total_users,
            "activeTours":           active_tours,
            "totalBookings":         total_bookings,
            "pendingVerifications":  pending_verifications,
            "systemStatus":          system_status,
        })


class PlatformActivityView(APIView):
    """
    GET /api/platform/activity/
    Returns the 20 most recent platform events derived from existing models.
    Events are sourced from user registrations, bookings, and verification
    requests so no separate activity-log model is needed.
    """
    permission_classes = [IsPlatformAdmin]

    def get(self, request):
        events = []

        # --- Recent user registrations (last 7 days) ---
        recent_users = (
            CustomUser.objects
            .filter(date_joined__gte=timezone.now() - timedelta(days=7))
            .values("email", "user_type", "date_joined")
            .order_by("-date_joined")[:10]
        )
        for u in recent_users:
            events.append({
                "action":    f"New {u['user_type'].replace('_', ' ').title()} registered: {u['email']}",
                "timestamp": u["date_joined"].strftime("%Y-%m-%d %H:%M"),
                "type":      "success",
            })

        # --- Recent bookings (last 7 days) ---
        recent_bookings = (
            Booking.objects
            .filter(created_at__gte=timezone.now() - timedelta(days=7))
            .select_related("tourist", "tour_schedule__tour")
            .order_by("-created_at")[:10]
        )
        for b in recent_bookings:
            events.append({
                "action":    f"Booking for \"{b.tour_schedule.tour.title}\" by {b.tourist.email}",
                "timestamp": b.created_at.strftime("%Y-%m-%d %H:%M"),
                "type":      "success" if b.status != "cancelled" else "warning",
            })

        # --- Recent verification requests (last 30 days) ---
        recent_verifications = (
            VerificationRequest.objects
            .filter(created_at__gte=timezone.now() - timedelta(days=30))
            .select_related("user")
            .order_by("-created_at")[:10]
        )
        for v in recent_verifications:
            type_label = "warning" if v.status == "pending" else (
                "success" if v.status == "approved" else "error"
            )
            events.append({
                "action":    f"Verification {v.status}: {v.request_type} — {v.user.email}",
                "timestamp": v.created_at.strftime("%Y-%m-%d %H:%M"),
                "type":      type_label,
            })

        # Sort all events newest-first and return top 20
        events.sort(key=lambda e: e["timestamp"], reverse=True)
        return Response(events[:20])


class PlatformHealthCheckView(APIView):
    """
    GET /api/platform/healthcheck/
    Verifies database connectivity and returns basic uptime metadata.
    """
    permission_classes = [IsPlatformAdmin]

    def get(self, request):
        db_ok = False
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            db_ok = True
        except Exception as e:
            return Response({
                "status":   "degraded",
                "database": False,
                "error":    str(e),
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        return Response({
            "status":    "healthy",
            "database":  db_ok,
            "timestamp": timezone.now().isoformat(),
        })


class PlatformReportsView(APIView):
    """
    POST /api/platform/reports/
    Accepts { "report_type": "<type>" } and returns aggregated statistics.

    Supported report types:
      - users_by_role    : user counts broken down by user_type
      - bookings_by_status : booking counts by status
      - tours_by_category  : active tour counts by category
      - verifications      : verification request counts by status
    """
    permission_classes = [IsPlatformAdmin]

    def post(self, request):
        report_type = request.data.get("report_type", "").strip()

        if report_type == "users_by_role":
            data = (
                CustomUser.objects
                .values("user_type")
                .annotate(count=Count("id"))
                .order_by("user_type")
            )
            return Response({
                "report_type": report_type,
                "data": list(data),
            })

        elif report_type == "bookings_by_status":
            data = (
                Booking.objects
                .values("status")
                .annotate(count=Count("id"))
                .order_by("status")
            )
            return Response({
                "report_type": report_type,
                "data": list(data),
            })

        elif report_type == "tours_by_category":
            data = (
                Tour.objects
                .filter(is_active=True)
                .values("category")
                .annotate(count=Count("id"))
                .order_by("category")
            )
            return Response({
                "report_type": report_type,
                "data": list(data),
            })

        elif report_type == "verifications":
            data = (
                VerificationRequest.objects
                .values("status", "request_type")
                .annotate(count=Count("id"))
                .order_by("request_type", "status")
            )
            return Response({
                "report_type": report_type,
                "data": list(data),
            })

        else:
            return Response(
                {
                    "error": "Unknown report_type.",
                    "supported": [
                        "users_by_role",
                        "bookings_by_status",
                        "tours_by_category",
                        "verifications",
                    ],
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
