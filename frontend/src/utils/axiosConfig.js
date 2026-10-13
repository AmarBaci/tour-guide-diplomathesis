import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const api = axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Return the correct login path for the given user_type.
 * Falls back to /select-account so the user can choose their portal.
 */
function getLoginPath() {
  try {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const loginRoutes = {
      tourist:          '/tourist/login',
      guide:            '/guide/login',
      agency_admin:     '/agency-admin/login',
      agency_operator:  '/agency-operator/login',
      ministry_admin:   '/ministry-admin/login',
      admin:            '/platform-admin/login',
    };
    return loginRoutes[userData.user_type] || '/select-account';
  } catch {
    return '/select-account';
  }
}

function clearAuthStorage() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userData');
}

// Request interceptor — attach token, redirect if already expired
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');

  if (token) {
    try {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        console.warn('Token expired, redirecting to login');
        clearAuthStorage();
        window.location.href = getLoginPath();
        return config;
      }
    } catch (e) {
      console.error('Token decode error:', e);
    }

    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

// Response interceptor — attempt silent refresh on 401, then redirect
api.interceptors.response.use(response => response, async error => {
  const originalRequest = error.config;

  if (error.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;

    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token');

      const response = await axios.post('/api/token/refresh/', {
        refresh: refreshToken
      });

      const newAccess = response.data.access;
      localStorage.setItem('accessToken', newAccess);
      originalRequest.headers.Authorization = `Bearer ${newAccess}`;

      return api(originalRequest);
    } catch (refreshError) {
      console.error('Token refresh failed:', refreshError);
      clearAuthStorage();
      window.location.href = getLoginPath();
    }
  }

  return Promise.reject(error);
});

export default api;