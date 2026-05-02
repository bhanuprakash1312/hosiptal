import axios from "axios";

const api = axios.create({
  // Use Vercel's env var when deployed, otherwise use localhost for your computer
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
