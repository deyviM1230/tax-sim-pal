import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, KeyRound, Loader2, Building2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Completa todos los campos");
      return;
    }
    setIsLoading(true);
    // Simular autenticación
    await new Promise((r) => setTimeout(r, 1000));
    localStorage.setItem("accessToken", "mock-token");
    localStorage.setItem("refreshToken", "mock-refresh");
    toast.success(mode === "login" ? "Sesión iniciada correctamente" : "Cuenta creada correctamente");
    navigate("/dashboard");
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary mb-4">
            <Building2 className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Sunat CTM</h1>
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
                : "Regístrate con tu correo electrónico"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-medium bg-gradient-primary"
                  disabled={isLoading}
                  onClick={() => setMode("login")}
                >
                  {isLoading && mode === "login" ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Conectando...</>
                  ) : (
                    "Iniciar sesión"
                  )}
                </Button>
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full h-12 text-base font-medium"
                  disabled={isLoading}
                  onClick={() => setMode("register")}
                >
                  {isLoading && mode === "register" ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando cuenta...</>
                  ) : (
                    "Registrarse"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
