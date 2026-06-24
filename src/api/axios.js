import axios from 'axios';

// Create Axios instance pointing to the Laravel API backend
const apiClient = axios.create({
  baseURL: 'https://apipbptugas9hph7fjiynxoqkzal7onbq3yehkzwzx41mvai2rmcs.soundofiwu.com/api/',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor: Automatically attach JWT token to outgoing requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle errors globally (e.g. clear expired token)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the backend returns a 401 Unauthorized, the token might be expired or invalid
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
