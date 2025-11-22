import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Configure axios defaults for better performance
axios.defaults.timeout = 10000; // 10 seconds timeout for all requests
axios.defaults.headers.common["Content-Type"] = "application/json";

// Create axios instance with base URL
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
      console.error("Request timeout:", error.config?.url);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

