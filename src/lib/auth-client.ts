import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    // La URL base de tu backend proporcionada en el contexto
    baseURL: "https://ptzsk572-3000.brs.devtunnels.ms" 
});