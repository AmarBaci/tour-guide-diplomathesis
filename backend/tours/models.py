import uuid
from django.db import models
from django.utils import timezone
from django.core.validators import MaxValueValidator, MinValueValidator
from users.models import CustomUser, GuideProfile, Agency

class Tour(models.Model):
    """Core simplified tour model"""
    TOUR_TYPE_CHOICES = [
        ('private', 'Private Tour'),
        ('group', 'Group Tour'),
    ]
    
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('moderate', 'Moderate'),
        ('challenging', 'Challenging'),
    ]
    
    CATEGORY_CHOICES = [
        ('adventure', 'Adventure'),
        ('cultural', 'Cultural'),
        ('historical', 'Historical'),
        ('nature', 'Nature'),
        ('culinary', 'Culinary'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField()
    
    # Relationships
    agency = models.ForeignKey(
        Agency, 
        on_delete=models.CASCADE,
        related_name='tours'
    )
    guide = models.ForeignKey(
        GuideProfile, 
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tours'
    )
    
    # Basic tour information
    tour_type = models.CharField(
        max_length=20, 
        choices=TOUR_TYPE_CHOICES, 
        default='group'
    )
    difficulty = models.CharField(
        max_length=20, 
        choices=DIFFICULTY_CHOICES, 
        default='moderate'
    )
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default='cultural'
    )
    
    # Location simplified to just text fields
    meeting_point = models.CharField(max_length=300, help_text="Where the tour starts")
    location_name = models.CharField(max_length=200, blank=True, null=True, help_text="General area or city")
    
    # Practical details
    duration_hours = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        help_text="Duration in hours"
    )
    price_per_person = models.DecimalField(
        max_digits=8, 
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text="Price per person in €"
    )
    max_group_size = models.PositiveIntegerField(
        default=10,
        validators=[MinValueValidator(1)]
    )
    
    # Simple text fields instead of arrays
    inclusions = models.TextField(
        blank=True,
        help_text="What's included (separate with commas)"
    )
    exclusions = models.TextField(
        blank=True,
        help_text="What's not included (separate with commas)"
    )
    
    # Status and timestamps
    is_active = models.BooleanField(
        default=True,
        help_text="Is this tour available for booking?"
    )
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.agency.name}"

class TourImage(models.Model):
    """Simple image model for tours"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tour = models.ForeignKey(
        Tour, 
        on_delete=models.CASCADE,
        related_name='images'
    )
    image = models.ImageField(upload_to='tour_images/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['uploaded_at']

    def __str__(self):
        return f"Image for {self.tour.title}"

class TourSchedule(models.Model):
    """Simplified schedule for tours"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tour = models.ForeignKey(
        Tour, 
        on_delete=models.CASCADE,
        related_name='schedules'
    )
    date = models.DateField()  # Simplified to just date
    start_time = models.TimeField()
    end_time = models.TimeField()
    available_slots = models.PositiveIntegerField(
        validators=[MinValueValidator(1)]
    )
    
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['date', 'start_time']

    def __str__(self):
        return f"{self.tour.title} on {self.date}"

class Booking(models.Model):
    """Simplified booking model"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tourist = models.ForeignKey(
        CustomUser, 
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    tour_schedule = models.ForeignKey(
        TourSchedule, 
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    number_of_people = models.PositiveIntegerField(
        default=1,
        validators=[MinValueValidator(1)]
    )
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        """Update available slots when booking is created or changed"""
        # This will be handled in the view for better control
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Booking #{str(self.id)[:8]} - {self.tourist.email}"
    
class Review(models.Model):
    """Simplified review model for MVP"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tour = models.ForeignKey(
        Tour,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Rating from 1 to 5 stars"
    )
    comment = models.TextField()
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['tour', 'user']  # One review per user per tour
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.rating}★ Review for {self.tour.title} by {self.user.email}"
    
class GuideOffer(models.Model):
    """Model for tracking guide offers and applications"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]
    
    OFFER_TYPE_CHOICES = [
        ('agency_offer', 'Agency Offer'),
        ('guide_application', 'Guide Application'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tour = models.ForeignKey(
        Tour,
        on_delete=models.CASCADE,
        related_name='guide_offers'
    )
    guide = models.ForeignKey(
        GuideProfile,
        on_delete=models.CASCADE,
        related_name='guide_offers'
    )
    proposed_salary = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        null=True,
        blank=True
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    offer_type = models.CharField(
        max_length=20,
        choices=OFFER_TYPE_CHOICES,
        default='agency_offer'
    )
    created_by = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='created_offers'
    )
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['tour', 'guide']  # Prevent duplicate offers
        ordering = ['-created_at']

    def __str__(self):
        if self.offer_type == 'agency_offer':
            return f"Offer for {self.tour.title} to {self.guide.user.get_full_name()}"
        else:
            return f"Application from {self.guide.user.get_full_name()} for {self.tour.title}"


class GuideAvailability(models.Model):
    """Stores dates a guide has marked as available or unavailable."""
    guide = models.ForeignKey(
        GuideProfile,
        on_delete=models.CASCADE,
        related_name='availability_entries'
    )
    date = models.DateField()
    is_available = models.BooleanField(default=True)

    class Meta:
        unique_together = ['guide', 'date']
        ordering = ['date']

    def __str__(self):
        status = 'available' if self.is_available else 'unavailable'
        return f"{self.guide.user.get_full_name()} – {self.date} ({status})"