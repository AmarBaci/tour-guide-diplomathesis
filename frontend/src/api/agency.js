import api from '../utils/axiosConfig';

export const agencyAPI = {
  // Tour Management
  getAgencyTours: () => {
    return api.get('/api/agency/tours/');
  },
  createTour: (tourData) => {
    return api.post('/api/agency/tours/', tourData);
  },

  // Tour Schedule Management
  createTourSchedule: (scheduleData) => {
    return api.post('/api/tour-schedules/', scheduleData);
  },
  getTourSchedules: () => {
    return api.get('/api/tour-schedules/');
  },

  // Guide Management
  getAvailableGuides: (params = {}) => {
    return api.get('/api/guide/profiles/', { params });
  },

  // Booking Management
  getBookingRequests: () => {
    return api.get('/api/bookings/');
  },
  updateBookingStatus: (bookingId, status) => {
    return api.patch(`/api/bookings/${bookingId}/`, { status });
  },
  confirmBooking: (bookingId) => {
    return api.post(`/api/bookings/${bookingId}/confirm/`);
  },
  rejectBooking: (bookingId) => {
    return api.patch(`/api/bookings/${bookingId}/`, { status: 'cancelled' });
  },

  // Tour actions
  deactivateTour: (tourId) => {
    return api.post(`/api/tours/${tourId}/deactivate/`);
  },
  deleteTour: (tourId) => {
    return api.delete(`/api/tours/${tourId}/`);
  },
  assignGuideToTour: (tourId, guideId) => {
    return api.post(`/api/tours/${tourId}/assign_guide/`, { guide: guideId });
  },

  // Operator Management
  getOperators: () => {
    return api.get('/api/agency/operators/');
  },
  createOperator: (operatorData, agencyId) => {
    return api.post(`/api/register/operator/${agencyId}/`, operatorData);
  },

  // Agency Profile
  getAgencyProfile: () => {
    return api.get('/api/agency/profile/');
  },
  updateAgencyProfile: (profileData) => {
    return api.patch('/api/agency/profile/', profileData);
  },

  // Guide Offer Management
  getGuideOffers: () => {
    return api.get('/api/guide-offers/?offer_type=agency_offer');
  },
  getGuideApplications: () => {
    return api.get('/api/guide-offers/?offer_type=guide_application');
  },
  createGuideOffer: (offerData) => {
    return api.post('/api/guide-offers/', offerData);
  },
  updateGuideOffer: (offerId, offerData) => {
    return api.patch(`/api/guide-offers/${offerId}/`, offerData);
  },

  respondToApplication: (applicationId, status) => {
    return api.patch(`/api/guide-offers/${applicationId}/`, { status });
  }
};
