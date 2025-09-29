// src/Services/api.jsx
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
  timeout: 8000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    console.log(`[API] Request to ${config.url}, Token: ${localStorage.getItem('Token')?.substring(0, 10)}...`);
    const token = localStorage.getItem('Token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("[API] Added Authorization header");
    } else {
      console.log("[API] No token found in localStorage");
    }
    return config;
  },
  (error) => {
    console.error("[API] Request error:", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log("[API] Response:", response.config.url, response.data);
    return response.data; // Always return response.data
  },
  (error) => {
    if (error.response) {
      console.error("[API] Server error:", {
        status: error.response.status,
        url: error.response.config.url,
        data: error.response.data,
      });

      if (error.response.status === 401) {
        localStorage.removeItem('Token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } else if (error.request) {
      console.error("[API] No response received:", error.request);
    } else {
      console.error("[API] Request setup error:", error.message);
    }

    return Promise.reject({
      message: error.response?.data?.message || "Network Error",
      status: error.response?.status,
      original: error,
    });
  }
);

export default api;