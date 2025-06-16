import axios from 'axios';

// Get the API base URL from environment variable or use default
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api/v1';

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors here (e.g., show notifications)
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
); 