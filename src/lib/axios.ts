import axios from "axios";

export const api = axios.create({
  baseURL: "https://ptzsk572-3000.brs.devtunnels.ms/api",
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