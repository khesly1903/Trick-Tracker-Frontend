import axios, { type AxiosInstance } from 'axios';
import { getStoredAccessToken, getStoredRefreshToken } from '../context/AuthContext';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getStoredAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.group(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    if (config.data) console.log('Payload:', config.data);
    console.groupEnd();
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  },
);

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
}

axiosInstance.interceptors.response.use(
  (response) => {
    console.group(`✅ API Response: ${response.status} ${response.config.url}`);
    console.log('Data:', response.data);
    console.groupEnd();
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = getStoredRefreshToken();
      if (!refreshToken) {
        localStorage.removeItem('tt_access_token');
        localStorage.removeItem('tt_refresh_token');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(axiosInstance(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || '/api'}/auth/refresh`,
          { refreshToken },
        );
        localStorage.setItem('tt_access_token', data.accessToken);
        localStorage.setItem('tt_refresh_token', data.refreshToken);
        axiosInstance.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
        processQueue(null, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('tt_access_token');
        localStorage.removeItem('tt_refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    console.group(`❌ API Error: ${error.response?.status || 'Network Error'} ${error.config?.url}`);
    console.error('Details:', error.response?.data || error.message);
    console.groupEnd();
    return Promise.reject(error);
  },
);

export default axiosInstance;
