import axios from 'axios';

// In production: Use full backend URL from environment variable
// In development: Use '/api' which Vite proxies to localhost:5000
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api' || 'https://interviewace-backend-7cx2.onrender.com/';

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Add a request interceptor to include the JWT token
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
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Don't redirect if we're already on the login page
            const currentPath = window.location.pathname;
            const isLoginAttempt = error.config.url?.includes('/auth/login');
            const isSignupAttempt = error.config.url?.includes('/auth/signup');

            // Only redirect if:
            // 1. We're NOT on  the auth pages
            // 2. This is NOT a login/signup attempt (those should show error inline)
            if (currentPath !== '/login' && currentPath !== '/signup' && !isLoginAttempt && !isSignupAttempt) {
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
