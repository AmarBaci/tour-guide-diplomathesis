import api from '../utils/axiosConfig';

export const guideAPI = {
  login: (credentials) => {
    return api.post('/api/auth/login/', credentials);
  },
  logout: () => {
    return api.post('/api/logout/');
  },
  refreshToken: (refreshToken) => {
    return api.post('/api/token/refresh/', { refresh: refreshToken });
  },

  // Guide Profile
  getMyProfile: () => {
    return api.get('/api/guide/profile/');
  },
  updateMyProfile: (profileData) => {
    return api.patch('/api/guide/profile/', profileData);
  },

  // Available Tours (Jobs) 
  getAvailableTours: () => {
    return api.get('/api/tours/?browse=true'); 
  },
  
  // Apply for a Tour 
  applyForTour: (tourId) => {
    return api.post('/api/guide-offers/apply/', { tour: tourId });
  },

  // Job Offers Management 
  getJobOffers: () => {
    return api.get('/api/guide-offers/');
  },
  respondToOffer: (offerId, status) => {
    return api.patch(`/api/guide-offers/${offerId}/`, { status });
  },

  // Availability Calendar
  getAvailability: () => {
    return api.get('/api/guide-availability/');
  },
  setAvailability: (date, isAvailable) => {
    return api.post('/api/guide-availability/', { date, is_available: isAvailable });
  },
  deleteAvailability: (id) => {
    return api.delete(`/api/guide-availability/${id}/`);
  },
};