// client/src/api/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to set auth header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    // --- MODIFICATION START ---
    // Only redirect if we are NOT on the login page. A 401 on the login page means invalid credentials.
    // Only redirect to login for admin/interviewer pages — NOT public pages
    const publicPaths = ['/', '/about', '/faq', '/terms-of-service', '/cookie-policy', '/applicationform', '/InterviewerApplication', '/login', '/forgot-password', '/create-password', '/reset-password', '/book', '/payment-confirmation', '/confirm-payment-received', '/application-success', '/skill-assessment', '/guidelines', '/guidelines-submission-success', '/skill-assessment-success', '/docs'];
    const currentPath = window.location.pathname;
    const isPublicPage = publicPaths.some(p => currentPath === p || currentPath.startsWith(p + '/'));
    if (error.response && error.response.status === 401 && !isPublicPage) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
