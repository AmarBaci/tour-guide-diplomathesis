import React, { useState, useEffect } from "react";
import { 
  FiCompass, 
  FiBookOpen, 
  FiUser, 
  FiUsers,
  FiSearch, 
  FiBell, 
  FiCalendar,
  FiMapPin,
  FiStar,
  FiLoader,
  FiXCircle,
  FiCheckCircle,
  FiLogOut,
  FiX,
  FiClock,
  FiMessageSquare
} from "react-icons/fi";
import { touristAPI } from "../../api/tourist";
import { useDashboard } from '../../context/DashboardContext';

const Dashboard = () => {
  const { activeTab: activePage, setActiveTab: setActivePage } = useDashboard();
  useEffect(() => { setActivePage(p => p || 'discover'); }, []);
  const [user, setUser] = useState(null);
  const [tours, setTours] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState({ 
    profile: false, 
    tours: false, 
    schedules: false,
    bookings: false,
    reviews: false,
    updateProfile: false,
    booking: false,
    cancelling: false,
    reviewing: false
  });
  const [error, setError] = useState({ 
    profile: null, 
    tours: null, 
    schedules: null,
    bookings: null,
    reviews: null,
    updateProfile: null,
    booking: null,
    cancelling: null,
    reviewing: null
  });
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    nationality: ""
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedTour, setSelectedTour] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    participants: 1
  });
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: ""
  });

  // Search & filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterTourType, setFilterTourType] = useState("");
  const [filterMinPrice, setFilterMinPrice] = useState("");
  const [filterMaxPrice, setFilterMaxPrice] = useState("");

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(prev => ({ ...prev, profile: true }));
        setError(prev => ({ ...prev, profile: null }));
        const response = await touristAPI.getMyProfile();
        setUser(response.data);
        setProfileForm({
          full_name: response.data.full_name || "",
          email: response.data.email || "",
          phone: response.data.phone || "",
          nationality: response.data.nationality || ""
        });
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError(prev => ({ ...prev, profile: "Failed to load your profile." }));
      } finally {
        setLoading(prev => ({ ...prev, profile: false }));
      }
    };
    
    fetchProfile();
  }, []);

  // Fetch available tours (re-runs when filters change)
  useEffect(() => {
    const fetchTours = async () => {
      if (activePage === 'discover') {
        try {
          setLoading(prev => ({ ...prev, tours: true }));
          setError(prev => ({ ...prev, tours: null }));

          const params = {};
          if (filterCategory) params.category = filterCategory;
          if (filterTourType) params.tour_type = filterTourType;
          if (filterMinPrice) params.min_price = filterMinPrice;
          if (filterMaxPrice) params.max_price = filterMaxPrice;

          const response = await touristAPI.getAvailableTours(params);
          
          // Handle different response structures
          let toursData = [];
          if (Array.isArray(response?.data)) {
            toursData = response.data;
          } else if (response?.data?.results) {
            toursData = response.data.results;
          }
          
          setTours(toursData);
        } catch (err) {
          console.error("Failed to fetch tours:", err);
          setError(prev => ({ ...prev, tours: "Failed to load available tours." }));
          setTours([]);
        } finally {
          setLoading(prev => ({ ...prev, tours: false }));
        }
      }
    };
    
    fetchTours();
  }, [activePage, filterCategory, filterTourType, filterMinPrice, filterMaxPrice]);

  // Fetch tour schedules
  useEffect(() => {
    const fetchSchedules = async () => {
      if (activePage === 'discover') {
        try {
          setLoading(prev => ({ ...prev, schedules: true }));
          setError(prev => ({ ...prev, schedules: null }));
          
          const response = await touristAPI.getAllTourSchedules();
          
          // Handle different response structures
          let schedulesData = [];
          if (Array.isArray(response?.data)) {
            schedulesData = response.data;
          } else if (response?.data?.results) {
            schedulesData = response.data.results;
          }
          
          setSchedules(schedulesData);
        } catch (err) {
          console.error("Failed to fetch schedules:", err);
          setError(prev => ({ ...prev, schedules: "Failed to load tour schedules." }));
          setSchedules([]);
        } finally {
          setLoading(prev => ({ ...prev, schedules: false }));
        }
      }
    };
    
    fetchSchedules();
  }, [activePage]);

  // Fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
      if (activePage === 'bookings') {
        try {
          setLoading(prev => ({ ...prev, bookings: true }));
          setError(prev => ({ ...prev, bookings: null }));
          
          const response = await touristAPI.getMyBookings();
          console.log("Bookings API response:", response);
          
          const bookingsData = response.data.results || response.data;
          setBookings(Array.isArray(bookingsData) ? bookingsData : []);
        } catch (err) {
          console.error("Failed to fetch bookings:", err);
          setError(prev => ({ ...prev, bookings: "Failed to load your bookings." }));
          setBookings([]);
        } finally {
          setLoading(prev => ({ ...prev, bookings: false }));
        }
      }
    };
    
    fetchBookings();
  }, [activePage]);

  // Get schedule for a specific tour
  const getSchedulesForTour = (tourId) => {
    return schedules.filter(schedule => schedule.tour === tourId);
  };

  // Get tour for a specific schedule
  const getTourForSchedule = (schedule) => {
    return tours.find(tour => tour.id === schedule.tour);
  };

  // Fetch reviews for a specific tour
  const fetchTourReviews = async (tourId) => {
    try {
      setLoading(prev => ({ ...prev, reviews: true }));
      setError(prev => ({ ...prev, reviews: null }));
      
      const response = await touristAPI.getTourReviews(tourId);
      
      // Handle different response structures
      let reviewsData = [];
      if (Array.isArray(response?.data)) {
        reviewsData = response.data;
      } else if (response?.data?.results) {
        reviewsData = response.data.results;
      } else if (response?.data?.reviews) {
        reviewsData = response.data.reviews;
      }
      
      setReviews(reviewsData);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
      setError(prev => ({ ...prev, reviews: "Failed to load reviews." }));
      setReviews([]);
    } finally {
      setLoading(prev => ({ ...prev, reviews: false }));
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(prev => ({ ...prev, updateProfile: true }));
      setError(prev => ({ ...prev, updateProfile: null }));
      setSuccessMessage("");
      
      const response = await touristAPI.updateMyProfile(profileForm);
      setUser(response.data);
      setSuccessMessage("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError(prev => ({ ...prev, updateProfile: "Failed to update profile." }));
    } finally {
      setLoading(prev => ({ ...prev, updateProfile: false }));
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, cancelling: true }));
      setError(prev => ({ ...prev, cancelling: null }));
      
      await touristAPI.cancelBooking(bookingId);
      
      // Update the local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'cancelled' } 
            : booking
        )
      );
      
      setSuccessMessage("Booking cancelled successfully.");
    } catch (err) {
      console.error("Failed to cancel booking:", err);
      setError(prev => ({ 
        ...prev, 
        cancelling: err.response?.data?.message || "Failed to cancel the booking." 
      }));
    } finally {
      setLoading(prev => ({ ...prev, cancelling: false }));
    }
  };

  const handleBookTour = async (schedule) => {
    try {
      const tour = getTourForSchedule(schedule);
      setSelectedTour(tour);
      setSelectedSchedule(schedule);
      setBookingData({ participants: 1 });
      setShowBookingModal(true);
    } catch (error) {
      console.error("Failed to prepare booking:", error);
      setError(prev => ({ ...prev, booking: "Failed to prepare booking." }));
    }
  };

  const confirmBooking = async () => {
    try {
      setLoading(prev => ({ ...prev, booking: true }));
      setError(prev => ({ ...prev, booking: null }));
      setSuccessMessage("");
      
      if (!selectedSchedule) {
        throw new Error("No schedule selected for booking");
      }
      
      // Check if there are enough available slots
      if (bookingData.participants > selectedSchedule.available_slots) {
        throw new Error(`Only ${selectedSchedule.available_slots} slots available`);
      }
      
      const bookingPayload = {
        tour_schedule: selectedSchedule.id,
        number_of_people: bookingData.participants
      };
      
      const response = await touristAPI.createBooking(bookingPayload);
      
      setSuccessMessage('Tour booked successfully!');
      setShowBookingModal(false);
      setSelectedTour(null);
      setSelectedSchedule(null);
      setBookingData({ participants: 1 });
      
      // Refresh the bookings list if on bookings page
      if (activePage === "bookings") {
        const bookingsResponse = await touristAPI.getMyBookings();
        const bookingsData = bookingsResponse.data.results || bookingsResponse.data;
        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      }
    } catch (error) {
      console.error('Booking failed:', error);
      
      // Extract the specific error message from the response
      let errorMessage = 'Failed to book tour. Please try again.';
      
      if (error.response?.data) {
        if (typeof error.response.data === 'object') {
          errorMessage = Object.values(error.response.data).flat().join(', ');
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(prev => ({ ...prev, booking: errorMessage }));
    } finally {
      setLoading(prev => ({ ...prev, booking: false }));
    }
  };

  const handleSubmitReview = async () => {
    try {
      if (!selectedTour || !selectedTour.id) {
        throw new Error("No tour selected for review");
      }
      
      setLoading(prev => ({ ...prev, reviewing: true }));
      setError(prev => ({ ...prev, reviewing: null }));
      
      const response = await touristAPI.createReview({
        tour: selectedTour.id,
        rating: parseInt(reviewData.rating),
        comment: reviewData.comment
      });
      
      setSuccessMessage("Review submitted successfully!");
      setShowReviewModal(false);
      setReviewData({ rating: 5, comment: "" });
      
      // Refresh reviews
      await fetchTourReviews(selectedTour.id);
    } catch (err) {
      console.error("Failed to submit review:", err);
      
      // Extract the specific error message from the response
      let errorMessage = "Failed to submit review.";
      
      if (err.response?.data) {
        if (err.response.data.non_field_errors) {
          errorMessage = err.response.data.non_field_errors.join(', ');
        } else if (typeof err.response.data === 'object') {
          errorMessage = Object.values(err.response.data).flat().join(', ');
        } else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(prev => ({ ...prev, reviewing: errorMessage }));
    } finally {
      setLoading(prev => ({ ...prev, reviewing: false }));
    }
  };

  const handleLogout = async () => {
    try {
      await touristAPI.logout();
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReviewInputChange = (e) => {
    const { name, value } = e.target;
    setReviewData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const openReviewModal = async (tour) => {
    if (!tour || !tour.id) {
      console.error("No tour selected or tour has no ID");
      setError(prev => ({ ...prev, reviews: "No tour selected for review." }));
      return;
    }
    
    setSelectedTour(tour);
    setShowReviewModal(true);
    await fetchTourReviews(tour.id);
  };

  const renderPage = () => {
    switch (activePage) {
      case "discover":
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Discover Tours</h1>
            
            {/* Search bar */}
            <div className="relative mb-4">
              <FiSearch className="absolute left-3 top-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search destinations, tours, or experiences..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              />
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap gap-3 mb-8">
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              >
                <option value="">All Categories</option>
                <option value="adventure">Adventure</option>
                <option value="cultural">Cultural</option>
                <option value="historical">Historical</option>
                <option value="nature">Nature</option>
                <option value="culinary">Culinary</option>
              </select>
              <select
                value={filterTourType}
                onChange={e => setFilterTourType(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              >
                <option value="">All Types</option>
                <option value="private">Private</option>
                <option value="group">Group</option>
              </select>
              <input
                type="number"
                placeholder="Min €"
                value={filterMinPrice}
                onChange={e => setFilterMinPrice(e.target.value)}
                min="0"
                className="p-2 border border-gray-300 rounded-lg text-sm w-24 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              />
              <input
                type="number"
                placeholder="Max €"
                value={filterMaxPrice}
                onChange={e => setFilterMaxPrice(e.target.value)}
                min="0"
                className="p-2 border border-gray-300 rounded-lg text-sm w-24 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              />
              {(filterCategory || filterTourType || filterMinPrice || filterMaxPrice || searchTerm) && (
                <button
                  onClick={() => { setFilterCategory(''); setFilterTourType(''); setFilterMinPrice(''); setFilterMaxPrice(''); setSearchTerm(''); }}
                  className="p-2 text-sm text-red-600 hover:text-red-800 border border-red-200 rounded-lg"
                >
                  Clear Filters
                </button>
              )}
            </div>
            
            {loading.tours || loading.schedules ? (
              <div className="flex justify-center items-center h-64">
                <FiLoader className="animate-spin text-4xl text-blue-500" />
              </div>
            ) : error.tours || error.schedules ? (
              <div className="text-red-500 text-center p-4">
                <FiXCircle className="inline-block mr-2" />
                {error.tours || error.schedules}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {schedules.filter(schedule => {
                  const tour = getTourForSchedule(schedule);
                  if (!tour) return false;
                  if (!searchTerm) return true;
                  const q = searchTerm.toLowerCase();
                  return (
                    tour.title?.toLowerCase().includes(q) ||
                    tour.location_name?.toLowerCase().includes(q) ||
                    tour.description?.toLowerCase().includes(q) ||
                    tour.category?.toLowerCase().includes(q)
                  );
                }).map((schedule) => {
                  const tour = getTourForSchedule(schedule);
                  if (!tour) return null;
                  
                  return (
                    <div key={schedule.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                      {tour.images && tour.images.length > 0 ? (
                        <img src={tour.images[0].image} alt={tour.title} className="w-full h-48 object-cover" />
                      ) : (
                        <div className="bg-gray-200 border-2 border-dashed w-full h-48" />
                      )}
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg">{tour.title || "Untitled Tour"}</h3>
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                            €{tour.price_per_person || "N/A"}
                          </span>
                        </div>
                        
                        {/* Show schedule-specific information */}
                        <div className="mb-3">
                          <div className="flex items-center text-sm text-gray-500 mb-1">
                            <FiCalendar className="mr-1" />
                            <span>{schedule.date ? new Date(schedule.date).toLocaleDateString() : "Date not set"}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mb-1">
                            <FiClock className="mr-1" />
                            <span>{schedule.start_time} - {schedule.end_time}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mb-1">
                            <FiUser className="mr-1" />
                            <span>Guide: {
                              tour.guide?.user?.get_full_name?.() || 
                              tour.guide?.user?.full_name || 
                              tour.guide?.full_name || 
                              tour.guide_name || 
                              "TBA"
                            }</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <FiUsers className="mr-1" />
                            <span>
                              {schedule.available_slots === 0 
                                ? "No slots left" 
                                : `${schedule.available_slots} slots available`
                              }
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <FiStar key={i} className={`${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'} mr-0.5`} />
                            ))}
                            <span className="ml-1 text-sm">(24)</span>
                          </div>
                          <button 
                            onClick={() => handleBookTour(schedule)}
                            disabled={schedule.available_slots === 0}
                            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                              schedule.available_slots === 0
                                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 text-white"
                            }`}
                          >
                            {schedule.available_slots === 0 ? "Fully Booked" : "Book Now"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
        
      case "bookings":
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">My Bookings</h1>
            
            {successMessage && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                <FiCheckCircle className="inline-block mr-2" />
                {successMessage}
              </div>
            )}
            
            {loading.bookings ? (
              <div className="flex justify-center items-center h-64">
                <FiLoader className="animate-spin text-4xl text-blue-500" />
              </div>
            ) : error.bookings ? (
              <div className="text-red-500 text-center p-4">
                <FiXCircle className="inline-block mr-2" />
                {error.bookings}
              </div>
            ) : bookings.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <FiBookOpen className="text-4xl text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                <p className="text-gray-500">Explore our tours and make your first booking!</p>
                <button 
                  onClick={() => setActivePage("discover")}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Discover Tours
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                  {bookings.map((booking) => {
                    // Get the tour schedule and tour information
                    const schedule = booking.tour_schedule;
                    const tour = schedule?.tour || {};
                    const guide = tour?.guide || {};
                    
                    // Try to get the guide name in multiple ways
                    const guideName = guide.user?.get_full_name?.() || 
                                     guide.user?.full_name || 
                                     guide.full_name || 
                                     guide.user?.email || 
                                     'Guide TBA';
                    
                    // Try to get the tour title
                    const tourTitle = tour.title || "Unknown Tour";
                    
                    return (
                      <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-bold text-lg">{tourTitle}</h3>
                            <p className="text-gray-600 text-sm">Booking #{booking.id.toString().slice(-8)}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-sm ${
                            booking.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800' 
                              : booking.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500 mb-3">
                          <FiCalendar className="mr-1" />
                          <span>
                            {schedule?.date ? new Date(schedule.date).toLocaleDateString() : "Date not set"}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-sm mb-4">
                          <div className="bg-gray-200 border-2 border-dashed rounded-full w-10 h-10" />
                          <div className="ml-3">
                            <p className="font-medium">{guideName}</p>
                            <p className="text-gray-500 text-sm">Licensed Tour Guide</p>
                          </div>
                        </div>
                        
                        <div className="flex justify-between">
                          <button 
                            onClick={() => openReviewModal(tour)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Leave Review
                          </button>
                          {(booking.status === 'pending' || booking.status === 'confirmed') && (
                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              disabled={loading.cancelling}
                              className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                            >
                              {loading.cancelling ? 'Cancelling...' : 'Cancel'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
        
      case "profile":
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">My Profile</h1>
            
            {successMessage && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                <FiCheckCircle className="inline-block mr-2" />
                {successMessage}
              </div>
            )}
            
            {loading.profile ? (
              <div className="flex justify-center items-center h-64">
                <FiLoader className="animate-spin text-4xl text-blue-500" />
              </div>
            ) : error.profile ? (
              <div className="text-red-500 text-center p-4">
                <FiXCircle className="inline-block mr-2" />
                {error.profile}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md overflow-hidden max-w-3xl">
                <form onSubmit={handleProfileUpdate}>
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row items-center mb-6">
                      <div className="bg-gray-200 border-2 border-dashed rounded-full w-24 h-24 mb-4 md:mb-0 md:mr-6" />
                      <div>
                        <h2 className="text-xl font-bold">{user?.full_name || "User"}</h2>
                        <p className="text-gray-600 mb-2">{user?.email || "No email"}</p>
                        <div className="flex items-center text-sm">
                          <FiMapPin className="mr-1 text-gray-500" />
                          <span>{user?.nationality || "No nationality set"}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Full Name</label>
                        <input
                          type="text"
                          name="full_name"
                          value={profileForm.full_name}
                          onChange={handleInputChange}
                          className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={profileForm.email}
                          onChange={handleInputChange}
                          className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Phone Number</label>
                        <input
                          type="tel"
                          name="phone"
                          value={profileForm.phone}
                          onChange={handleInputChange}
                          className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">Nationality</label>
                        <input
                          type="text"
                          name="nationality"
                          value={profileForm.nationality}
                          onChange={handleInputChange}
                          className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    {error.updateProfile && (
                      <div className="text-red-500 mb-4">
                        <FiXCircle className="inline-block mr-2" />
                        {error.updateProfile}
                      </div>
                    )}
                    
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={loading.updateProfile}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center"
                      >
                        {loading.updateProfile ? (
                          <>
                            <FiLoader className="animate-spin mr-2" />
                            Saving...
                          </>
                        ) : "Save Changes"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        );
        
      default:
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Welcome to your Tourist Dashboard{user?.full_name ? `, ${user.full_name}` : ''}!</h1>
            <p className="text-gray-600 mb-6">
              Discover amazing tours, manage your bookings, and update your profile all in one place.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: <FiCompass size={24} />, title: 'Discover Tours', desc: 'Explore our curated selection of tours and experiences', action: () => setActivePage('discover') },
                { icon: <FiBookOpen size={24} />, title: 'My Bookings', desc: 'View and manage your upcoming tours', action: () => setActivePage('bookings') },
                { icon: <FiUser size={24} />, title: 'My Profile', desc: 'Update your personal information', action: () => setActivePage('profile') }
              ].map((item, index) => (
                <div 
                  key={index} 
                  onClick={item.action}
                  className="bg-white p-6 rounded-xl shadow-md cursor-pointer hover:shadow-lg transition-shadow flex flex-col items-center text-center"
                >
                  <div className="bg-blue-100 p-3 rounded-full mb-4 text-blue-600">
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-600 mb-4">{item.desc}</p>
                  <button className="mt-auto text-blue-600 font-medium">
                    Go to {item.title}
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950">

        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto">
          {renderPage()}
        </div>

      {/* Booking Modal */}
      {showBookingModal && selectedTour && selectedSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Book {selectedTour.title}</h2>
              <button 
                onClick={() => setShowBookingModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>
            
            {error.booking && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <FiXCircle className="inline-block mr-2" />
                {error.booking}
              </div>
            )}
            
            <div className="space-y-4 mb-6">
              {/* Show schedule information */}
              {selectedSchedule && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="font-medium mb-2">Tour Schedule</h4>
                  <p className="text-sm">
                    <strong>Date:</strong> {selectedSchedule.date ? new Date(selectedSchedule.date).toLocaleDateString() : "Not set"}<br />
                    <strong>Time:</strong> {selectedSchedule.start_time} - {selectedSchedule.end_time}<br />
                    <strong>Guide:</strong> {
                      selectedTour.guide?.user?.get_full_name?.() || 
                      selectedTour.guide?.user?.full_name || 
                      selectedTour.guide?.full_name || 
                      selectedTour.guide_name || 
                      "To be assigned"
                    }<br />
                    <strong>Available slots:</strong> {selectedSchedule.available_slots === 0 
                      ? "No slots left" 
                      : `${selectedSchedule.available_slots} slots available`
                    }
                  </p>
                </div>
              )}
              
              {/* Number of participants input */}
              <div>
                <label className="block text-gray-700 mb-2">Number of Participants</label>
                <input
                  type="number"
                  min="1"
                  max={selectedSchedule?.available_slots || 1}
                  value={bookingData.participants}
                  onChange={(e) => setBookingData({...bookingData, participants: parseInt(e.target.value) || 1})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={selectedSchedule?.available_slots === 0}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {selectedSchedule?.available_slots === 0 
                    ? "No slots available for booking" 
                    : `Maximum: ${selectedSchedule?.available_slots || 1} participants`
                  }
                </p>
              </div>
              
              {/* Price information */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Price per person:</strong> €{selectedTour?.price_per_person || "N/A"}<br />
                  <strong>Total:</strong> €{(selectedTour?.price_per_person || 0) * bookingData.participants}
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowBookingModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              
              <button
                onClick={confirmBooking}
                disabled={!bookingData.participants || bookingData.participants < 1 || loading.booking || selectedSchedule?.available_slots === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading.booking ? (
                  <>
                    <FiLoader className="animate-spin mr-2" />
                    Booking...
                  </>
                ) : selectedSchedule?.available_slots === 0 ? "Fully Booked" : "Confirm Booking"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedTour && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Reviews for {selectedTour.title}</h2>
              <button 
                onClick={() => setShowReviewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>
            
            {error.reviewing && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <FiXCircle className="inline-block mr-2" />
                {error.reviewing}
              </div>
            )}
            
            <div className="mb-6">
              <h3 className="font-medium mb-3">Write a Review</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Rating</label>
                  <select
                    name="rating"
                    value={reviewData.rating}
                    onChange={handleReviewInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={5}>5 Stars</option>
                    <option value={4}>4 Stars</option>
                    <option value={3}>3 Stars</option>
                    <option value={2}>2 Stars</option>
                    <option value={1}>1 Star</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2">Review</label>
                  <textarea
                    name="comment"
                    value={reviewData.comment}
                    onChange={handleReviewInputChange}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Share your experience with this tour..."
                  />
                </div>
                
                <button
                  onClick={handleSubmitReview}
                  disabled={loading.reviewing || !reviewData.comment}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading.reviewing ? (
                    <>
                      <FiLoader className="animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : "Submit Review"}
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-3">All Reviews</h3>
              {loading.reviews ? (
                <div className="flex justify-center items-center py-8">
                  <FiLoader className="animate-spin text-2xl text-blue-500 mr-3" />
                  <span>Loading reviews...</span>
                </div>
              ) : error.reviews ? (
                <div className="text-red-500 text-center py-4">
                  <FiXCircle className="inline-block mr-2" />
                  {error.reviews}
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FiMessageSquare className="text-4xl mx-auto mb-4 opacity-50" />
                  <p>No reviews yet. Be the first to review this tour!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map(review => (
                    <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">
                            {review.user?.full_name || 
                            review.user_name || 
                            review.user?.email || 
                            "Anonymous"}
                          </h4>
                          <div className="flex items-center mt-1">
                            {[...Array(5)].map((_, i) => (
                              <FiStar 
                                key={i} 
                                className={`${i < (review.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'} mr-0.5`} 
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.created_at || review.date || new Date()).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{review.comment || "No comment provided"}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;