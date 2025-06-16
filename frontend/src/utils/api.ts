import axios from 'axios';

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: '/api/v1', // Now requests will go to /api/v1/...
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