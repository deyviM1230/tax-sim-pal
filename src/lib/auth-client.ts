import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    // CAMBIO IMPORTANTE: Ahora apuntamos a la misma URL donde corre tu app
    // El proxy de Vite interceptará las llamadas a /api/*
    baseURL: "http://localhost:8080" 
});