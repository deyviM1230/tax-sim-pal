import axios from "axios";
import env from "./env.config";

export const api = axios.create({
  baseURL: env.VITE_API_URL + "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Opcional: Interceptor para incluir el token en cada petición automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});