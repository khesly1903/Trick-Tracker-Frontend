import axios, { type AxiosInstance } from 'axios';

/**
 * Centered axios configuration for all API requests.
 */
const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Logs outgoing calls
axiosInstance.interceptors.request.use(
  (config) => {
    console.group(
      `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`,
    );
    if (config.data) {
      console.log('Payload:', config.data);
    }
    console.groupEnd();
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  },
);

// Response Interceptor: Logs incoming results
axiosInstance.interceptors.response.use(
  (response) => {
    console.group(`✅ API Response: ${response.status} ${response.config.url}`);
    console.log('Data:', response.data);
    console.groupEnd();
    return response;
  },
  (error) => {
    console.group(
      `❌ API Error: ${error.response?.status || 'Network Error'} ${error.config?.url}`,
    );
    console.error('Details:', error.response?.data || error.message);
    console.groupEnd();
    return Promise.reject(error);
  },
);

export default axiosInstance;
