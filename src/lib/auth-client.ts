import { createAuthClient } from "better-auth/react";
import env from "./env.config";

export const authClient = createAuthClient({
    // CAMBIO IMPORTANTE: Ahora apuntamos a la misma URL donde corre tu app
    // El proxy de Vite interceptará las llamadas a /api/*
    baseURL: env.VITE_API_URL 
});