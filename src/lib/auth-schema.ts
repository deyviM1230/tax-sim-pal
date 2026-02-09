import { z } from "zod";

const dniSchema = z.object({
  documentType: z.literal("DNI"),
  document: z.string().length(8, "El DNI debe tener 8 dígitos").regex(/^\d+$/, "Solo números"),
  solKey: z.string().min(1, "Clave SOL requerida"),
});

const rucSchema = z.object({
  documentType: z.literal("RUC"),
  document: z.string().length(11, "El RUC debe tener 11 dígitos").regex(/^\d+$/, "Solo números"),
  username: z.string().min(1, "Usuario requerido"),
  solKey: z.string().min(1, "Clave SOL requerida"),
});

export const authSchema = z.discriminatedUnion("documentType", [rucSchema, dniSchema]);

export type LoginRequest = z.infer<typeof authSchema>;

export interface AuthResponse {
  userId: number;
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
}