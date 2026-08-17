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
  const adminToken = localStorage.getItem('dewan_admin_token');
  const userToken = localStorage.getItem('dewan_user_token');

  // Check if this request is from an admin context or targeting an admin/upload endpoint
  const url = config.url || '';
  const isAdminRequest =
    url.startsWith('/admin') ||
    url.startsWith('/upload/admin') ||
    url.includes('admin') ||
    (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin'));

  if (isAdminRequest && adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
    config.headers['x-admin-token'] = adminToken;
  } else if (userToken) {
    config.headers.Authorization = `Bearer ${userToken}`;
  } else if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
    config.headers['x-admin-token'] = adminToken;
  }

  return config;
});

// Interceptor to handle session expiration and auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      const isAdminContext =
        url.startsWith('/admin') ||
        url.startsWith('/upload/admin') ||
        url.includes('admin') ||
        (typeof window !== 'undefined' &&
          window.location.pathname.startsWith('/admin') &&
          window.location.pathname !== '/admin/login');

      if (isAdminContext) {
        console.warn('⚠️ Admin session expired or unauthorized. Redirecting to admin login...');
        localStorage.removeItem('dewan_admin_token');
        localStorage.removeItem('dewan_admin_user');
        if (typeof window !== 'undefined' && window.location.pathname !== '/admin/login') {
          window.location.href = '/admin/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
