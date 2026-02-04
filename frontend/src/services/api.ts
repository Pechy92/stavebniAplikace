import axios from 'axios';

// Use environment variable or fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'http://localhost:3001/api';

console.log('🌐 API Base URL:', API_BASE_URL);
console.log('🔧 Environment:', import.meta.env.MODE);
console.log('🔑 VITE_API_URL:', import.meta.env.VITE_API_URL);

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
