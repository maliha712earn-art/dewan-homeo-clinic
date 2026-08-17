import axios from 'axios';

const apiBaseUrl = (import.meta as any).env?.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach User or Admin JWT
api.interceptors.request.use((config) => {
  // If request is to /admin endpoints, use admin token
  if (config.url?.startsWith('/admin')) {
    const adminToken = localStorage.getItem('dewan_admin_token');
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
  } else {
    // Normal user token
    const userToken = localStorage.getItem('dewan_user_token');
    if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 unauth
    if (error.response?.status === 401 && error.config?.url?.startsWith('/admin')) {
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        localStorage.removeItem('dewan_admin_token');
        localStorage.removeItem('dewan_admin_user');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
