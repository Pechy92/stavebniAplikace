/**
 * API configuration
 */

export const API_BASE_URL = import.meta.env.MODE === 'production'
  ? 'https://stavebniaplikacebackend-production.up.railway.app'
  : 'http://localhost:3001';

export const API_URL = `${API_BASE_URL}/api`;
