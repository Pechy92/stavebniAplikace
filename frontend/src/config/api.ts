/**
 * API configuration
 */

const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  if (import.meta.env.MODE === 'production') {
    return 'https://api-stavby.cmpe.cz';
  }
  
  return 'http://localhost:3001';
};

export const API_BASE_URL = getApiBaseUrl();
export const API_URL = `${API_BASE_URL}/api`;
