import axios from 'axios';

// Ensure API URL always ends with /api
let apiUrl = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.MODE === 'production' 
    ? 'https://stavebniaplikace.up.railway.app' 
    : 'http://localhost:3001');

// Remove trailing slash if present
apiUrl = apiUrl.replace(/\/$/, '');

// Add /api if not already present
if (!apiUrl.endsWith('/api')) {
  apiUrl += '/api';
}

const API_BASE_URL = apiUrl;

console.log('🌐 API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Přidat token do každého requestu
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Přesměrovat na login při 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
