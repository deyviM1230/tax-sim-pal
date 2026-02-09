import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, KeyRound, Loader2, Building2, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client"; // Importamos tu cliente configurado

export default function Login() {
  const navigate = useNavigate();
  const [name, setName] = useState(""); // Necesario para el registro
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === "login") {
        // --- LÓGICA DE INICIO DE SESIÓN ---
        const { data, error } = await authClient.signIn.email({
          email,
          password,
        });

        if (error) {
          toast.error(error.message || "Error al iniciar sesión");
        } else {
          toast.success("¡Bienvenido de nuevo!");
          navigate("/dashboard");
        }
      } else {
        // --- LÓGICA DE REGISTRO ---
        if (!name) {
          toast.error("El nombre es requerido para registrarse");
          setIsLoading(false);
          return;
        }

        const { data, error } = await authClient.signUp.email({
          email,
          password,
          name, // Better Auth suele pedir nombre por defecto
        });

        if (error) {
          toast.error(error.message || "Error al crear cuenta");
        } else {
          toast.success("Cuenta creada exitosamente");
          navigate("/dashboard");
        }
      }
    } catch (err) {
      toast.error("Ocurrió un error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary mb-4">
            <Building2 className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">RCTM Sunat</h1>
          <p className="text-muted-foreground mt-1">Simulador de Impuesto a la Renta</p>
        </div>

        <Card className="shadow-card border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">
              {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
            </CardTitle>
            <CardDescription>
              {mode === "login"
                ? "Ingresa tu correo y contraseña para continuar"
                : "Regístrate para guardar tus cálculos"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              
              {/* Campo Nombre (Solo visible en Registro) */}
              {mode === "register" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <Label htmlFor="name">Nombre completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Juan Perez"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 h-11"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-11"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                {/* Botón Principal (Cambia según el modo) */}
                <Button
                  onClick={handleSubmit}
                  className="w-full h-12 text-base font-medium bg-gradient-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando...</>
                  ) : (
                    mode === "login" ? "Ingresar" : "Registrarse"
                  )}
                </Button>

                {/* Botón para cambiar de modo */}
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-sm text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                  onClick={() => setMode(mode === "login" ? "register" : "login")}
                >
                  {mode === "login" 
                    ? "¿No tienes cuenta? Regístrate aquí" 
                    : "¿Ya tienes cuenta? Inicia sesión"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}