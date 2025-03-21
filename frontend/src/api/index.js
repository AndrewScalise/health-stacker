import axios from "axios";
import { getToken, removeToken } from "../utils/auth";

// Create axios instance with base URL from environment
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      // If you implement refresh token logic, it would go here

      // For now, just log out the user on auth errors
      removeToken();
      window.location.href = "/login";
    }

    // Show error notification
    const errorMessage = error.response?.data?.error || "Something went wrong";
    console.error(errorMessage);

    return Promise.reject(error);
  }
);

export default api;
