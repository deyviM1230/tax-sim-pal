import { z } from "zod";

// Esquema para DNI
const dniSchema = z.object({
  documentType: z.literal("DNI"),
  document: z.string()
    .length(8, "El DNI debe tener 8 dígitos")
    .regex(/^\d+$/, "Solo se permiten números"),
  solKey: z.string().min(1, "La clave SOL es requerida"),
});

// Esquema para RUC
const rucSchema = z.object({
  documentType: z.literal("RUC"),
  document: z.string()
    .length(11, "El RUC debe tener 11 dígitos")
    .regex(/^\d+$/, "Solo se permiten números"),
  username: z.string().min(1, "El usuario SOL es obligatorio para RUC"),
  solKey: z.string().min(1, "La clave SOL es requerida"),
});

// Unión discriminada por el campo 'documentType'
export const authSchema = z.discriminatedUnion("documentType", [dniSchema, rucSchema]);

export type LoginRequest = z.infer<typeof authSchema>;

export interface AuthResponse {
  userId: number;
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
}