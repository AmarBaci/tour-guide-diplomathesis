from rest_framework import serializers
from .models import Tour, TourImage, TourSchedule, Booking, Review, GuideOffer, GuideAvailability
from users.models import Agency, GuideProfile
from users.serializers import GuideProfileSerializer  # Import GuideProfileSerializer

class TourImageSerializer(serializers.ModelSerializer):
    """Serializer for tour images"""
    class Meta:
        model = TourImage
        fields = ['id', 'image', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']


class TourScheduleSerializer(serializers.ModelSerializer):
    """Serializer for tour schedules"""
    tour_title = serializers.CharField(source='tour.title', read_only=True)
    tour = serializers.PrimaryKeyRelatedField(queryset=Tour.objects.all())  # Keep for writes
    
    class Meta:
        model = TourSchedule
        fields = [
            'id', 'tour', 'tour_title', 'date', 'start_time', 
            'end_time', 'available_slots', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class TourSerializer(serializers.ModelSerializer):
    """Main serializer for tours with nested relationships"""
    # Nested serializers for related objects
    images = TourImageSerializer(many=True, read_only=True)
    schedules = TourScheduleSerializer(many=True, read_only=True)
    
    # Read-only fields for related object details
    agency_name = serializers.CharField(source='agency.name', read_only=True)
    guide_name = serializers.CharField(source='guide.user.get_full_name', read_only=True, allow_null=True)
    
    class Meta:
        model = Tour
        fields = [
            'id', 'title', 'description', 'agency', 'agency_name', 'guide', 'guide_name',
            'tour_type', 'difficulty', 'category', 'meeting_point', 'location_name',
            'duration_hours', 'price_per_person', 'max_group_size', 'inclusions',
            'exclusions', 'is_active', 'created_at', 'updated_at', 'images', 'schedules'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'agency_name', 'guide_name']
    
    def validate(self, data):
        """Custom validation for tour data"""
        # Ensure the agency user is creating tours for their own agency
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            if hasattr(request.user, 'agency_admin_profile'):
                if data.get('agency') != request.user.agency_admin_profile.agency:
                    raise serializers.ValidationError(
                        "You can only create tours for your own agency."
                    )
        return data


class BookingSerializer(serializers.ModelSerializer):
    """Serializer for bookings"""
    # Read-only fields for related information
    tourist_name = serializers.CharField(source='tourist.get_full_name', read_only=True)
    tour_title = serializers.CharField(source='tour_schedule.tour.title', read_only=True)
    schedule_info = serializers.CharField(
        source='tour_schedule.date', 
        read_only=True
    )
    total_price = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'id', 'tourist', 'tourist_name', 'tour_schedule', 'tour_title',
            'schedule_info', 'number_of_people', 'status', 'total_price',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'tourist', 'created_at', 'updated_at', 'total_price']
    
    def get_total_price(self, obj):
        """Calculate total price based on number of people and tour price"""
        if hasattr(obj, 'tour_schedule') and obj.tour_schedule.tour:
            return obj.number_of_people * obj.tour_schedule.tour.price_per_person
        return 0
    
    def validate(self, data):
        """Custom validation for bookings"""
        request = self.context.get('request')
        tour_schedule = data.get('tour_schedule')
        number_of_people = data.get('number_of_people', 1)
        
        # Check availability
        if tour_schedule and number_of_people:
            if tour_schedule.available_slots < number_of_people:
                raise serializers.ValidationError(
                    f"Not enough available slots. Only {tour_schedule.available_slots} left."
                )
        
        return data

# Simplified serializers for list views (to avoid heavy nested data)
class TourListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing tours"""
    agency_name = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Tour
        fields = [
            'id', 'title', 'agency_name', 'tour_type', 'difficulty',
            'category', 'duration_hours', 'price_per_person', 'image_url'
        ]
    
    def get_agency_name(self, obj):
        """Get agency name safely"""
        return obj.agency.name if obj.agency else "Unknown Agency"
    
    def get_image_url(self, obj):
        """Get the first image URL if available"""
        if obj.images.exists():
            return obj.images.first().image.url
        return None


class BookingListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing bookings"""
    tour_title = serializers.CharField(source='tour_schedule.tour.title', read_only=True)
    date = serializers.DateField(source='tour_schedule.date', read_only=True)
    start_time = serializers.TimeField(source='tour_schedule.start_time', read_only=True)
    total_price = serializers.SerializerMethodField()
    
    class Meta:
        model = Booking
        fields = [
            'id', 'tour_title', 'date', 'start_time', 
            'number_of_people', 'status', 'total_price'
        ]
    
    def get_total_price(self, obj):
        """Calculate total price"""
        return obj.number_of_people * obj.tour_schedule.tour.price_per_person

class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for reviews"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = Review
        fields = [
            'id', 'tour', 'user', 'user_name', 'rating', 
            'comment', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'user_name']
    
    def validate(self, data):
        """Ensure users can only review tours they've booked and completed"""
        request = self.context.get('request')
        tour = data.get('tour')
        
        if request and request.user.is_authenticated:
            # Check if user has completed booking for this tour
            completed_bookings = Booking.objects.filter(
                tourist=request.user,
                tour_schedule__tour=tour,
                status='confirmed'
            )
            
            if not completed_bookings.exists():
                raise serializers.ValidationError(
                    "You can only review tours you've completed."
                )
            
            # Check if user already reviewed this tour
            existing_review = Review.objects.filter(
                tour=tour,
                user=request.user
            ).exists()
            
            if existing_review:
                raise serializers.ValidationError(
                    "You've already reviewed this tour."
                )
        
        return data
    
    def create(self, validated_data):
        # Automatically set the user to the current user
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
    
class GuideOfferSerializer(serializers.ModelSerializer):
    """Serializer for guide offers"""
    tour = TourListSerializer(read_only=True)  # Nested tour object
    guide = GuideProfileSerializer(read_only=True)  # Nested guide object
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    agency_name = serializers.CharField(source='tour.agency.name', read_only=True)

    class Meta:
        model = GuideOffer
        fields = [
            'id', 'tour', 'guide', 'proposed_salary',
            'status', 'offer_type', 'created_by', 'created_by_name', 'agency_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']

    def validate(self, data):
        """Ensure the offer is for a tour from the same agency"""
        request = self.context.get('request')
        tour = data.get('tour')
        guide = data.get('guide')

        if request and request.user.is_authenticated:
            # For agency offers, check if the user is an agency admin/operator
            if data.get('offer_type', 'agency_offer') == 'agency_offer':
                if hasattr(request.user, 'agency_admin_profile'):
                    agency = request.user.agency_admin_profile.agency
                elif hasattr(request.user, 'agency_operator_profile'):
                    agency = request.user.agency_operator_profile.agency
                else:
                    raise serializers.ValidationError("Only agency staff can create offers.")

                if tour.agency != agency:
                    raise serializers.ValidationError("You can only create offers for your agency's tours.")

                # Check if guide is approved
                if not guide.is_approved:
                    raise serializers.ValidationError("You can only make offers to approved guides.")

        return data

    def create(self, validated_data):
        # Set the created_by field to the current user
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class GuideOfferUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating guide offer status (used by guides)"""
    class Meta:
        model = GuideOffer
        fields = ['status']
        read_only_fields = ['id', 'tour', 'guide', 'proposed_salary', 'created_by', 'offer_type']

    def validate_status(self, value):
        """Ensure only valid status transitions"""
        if self.instance and self.instance.status == 'accepted' and value != 'accepted':
            raise serializers.ValidationError("Cannot change an accepted offer.")
        return value


class GuideAvailabilitySerializer(serializers.ModelSerializer):
    """Serializer for guide availability entries"""
    class Meta:
        model = GuideAvailability
        fields = ['id', 'date', 'is_available']
        read_only_fields = ['id']