import { api } from "@/lib/axios";
import { LoginRequest } from "@/lib/auth-schema";
import { AuthResponse } from "@/lib/auth-schema";


export const loginUser = async (data: LoginRequest): Promise<AuthResponse> => {
  // Axios ya sabe que la URL base es https://.../api
  const response = await api.post<AuthResponse>("/auth/login", data);
  
  // Axios guarda el cuerpo de la respuesta en la propiedad .data
  return response.data;
};