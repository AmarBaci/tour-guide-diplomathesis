import api from '../utils/axiosConfig';

export const ministryAPI = {
  // Verification endpoints
  getVerificationRequests: () => {
    return api.get('/api/verification/requests/');
  },

  updateVerificationStatus: (requestId, statusData) => {
    return api.patch(`/api/verification/requests/${requestId}/`, statusData);
  },

  // Ministry-specific endpoints
  getAllGuides: () => {
    return api.get('/api/ministry/guides/');
  },

  getAllAgencies: () => {
    return api.get('/api/ministry/agencies/');
  },

  createAllVerifications: () => {
    return api.post('/api/verification/create-all/');
  }
};