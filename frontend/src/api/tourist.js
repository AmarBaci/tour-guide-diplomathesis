import api from '../utils/axiosConfig'; 

export const touristAPI = {
  login: (credentials) => {
    return api.post('/api/auth/login/', credentials);
  },
  logout: () => {
    return api.post('/api/logout/');
  },
  refreshToken: (refreshToken) => {
    return api.post('/api/token/refresh/', { refresh: refreshToken });
  },

  getMyProfile: () => {
    return api.get('/api/tourist/profile/'); 
  },
  updateMyProfile: (profileData) => {
    return api.patch('/api/tourist/profile/', profileData); 
  },

  // Get all available tours (with optional filters)
  getAvailableTours: (params = {}) => {
    return api.get('/api/tours/', { params });
  },

  // Get specific tour details
  getTourDetail: (tourId) => {
    return api.get(`/api/tours/${tourId}/`); 
  },

  // Get user's bookings
  getMyBookings: () => {
    return api.get('/api/bookings/'); 
  },
  
  // Create a new booking
  createBooking: (bookingData) => {
    return api.post('/api/bookings/', bookingData); 
  },

  // Cancel a booking (uses the /cancel/ action which properly restores slots)
  cancelBooking: (bookingId) => {
    return api.post(`/api/bookings/${bookingId}/cancel/`);
  },
  
  // Update a booking
  updateBooking: (bookingId, data) => {
    return api.patch(`/api/bookings/${bookingId}/`, data);
  },

  // Get reviews for a tour
  getTourReviews: (tourId) => {
    return api.get(`/api/reviews/?tour=${tourId}`);
  },
  
  // Create a review
  createReview: (reviewData) => {
    return api.post('/api/reviews/', reviewData);
  },

  getReviewStatus: (reviewId) => {
    return api.get(`/api/reviews/${reviewId}/`);
  },

  updateReview: (reviewId, reviewData) => {
    return api.patch(`/api/reviews/${reviewId}/`, reviewData);
  },
  
  getMyCompletedBookings: () => {
    return api.get('/api/bookings/?status=confirmed');
  },
  
  // Get tour schedules for a specific tour
  getTourSchedules: (tourId) => {
    return api.get(`/api/tour-schedules/?tour=${tourId}`);
  },
  
  // Get all available tour schedules
  getAllTourSchedules: () => {
    return api.get('/api/tour-schedules/');
  }
};