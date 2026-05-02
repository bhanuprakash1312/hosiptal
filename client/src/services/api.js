import axios from "axios";

const api = axios.create({
  // In Vite, env vars are accessed via import.meta.env and MUST start with VITE_
  // For local development this falls back to localhost
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
