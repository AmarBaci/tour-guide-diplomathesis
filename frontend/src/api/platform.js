import api from '../utils/axiosConfig';

export const platformAPI = {
  getUserStats: () => {
    return api.get('/api/platform/stats/');
  },
  getRecentActivity: () => {
    return api.get('/api/platform/activity/');
  },
  generateReport: (reportType) => {
    return api.post('/api/platform/reports/', { report_type: reportType });
  },
  runHealthCheck: () => {
    return api.get('/api/platform/healthcheck/');
  }
};