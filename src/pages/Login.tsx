import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, User, KeyRound, CreditCard, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { authSchema, type LoginRequest } from "@/lib/auth-schema";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const [tipoId, setTipoId] = useState<"RUC" | "DNI">("RUC");
  const { mutate: login, isPending } = useAuth();

  const form = useForm<LoginRequest>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      documentType: "RUC",
      document: "",
      username: "",
      solKey: "",
    },
  });

  const handleTipoChange = (value: "RUC" | "DNI") => {
    setTipoId(value);
    if (value === "RUC") {
      form.reset({ documentType: "RUC", document: "", username: "", solKey: "" });
    } else {
      form.reset({ documentType: "DNI", document: "", solKey: "" });
    }
  };

  const onSubmit = (data: LoginRequest) => {
    login(data, {
      onSuccess: (response) => {
        localStorage.setItem("accessToken", response.accessToken);
        localStorage.setItem("refreshToken", response.refreshToken);
        toast.success("Sesión iniciada correctamente");
        navigate("/dashboard");
      },
      onError: (error: any) => {
        const message = error.response?.data?.message || "Credenciales incorrectas";
        toast.error(message);
      }
    });
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
            <CardTitle className="text-xl">Iniciar sesión</CardTitle>
            <CardDescription>Ingresa tus credenciales para continuar</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label>Tipo de identificación</Label>
                  <Select value={tipoId} onValueChange={handleTipoChange}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RUC">
                        <div className="flex items-center gap-2"><Building2 className="w-4 h-4" />RUC</div>
                      </SelectItem>
                      <SelectItem value="DNI">
                        <div className="flex items-center gap-2"><CreditCard className="w-4 h-4" />DNI</div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <FormField
                  control={form.control}
                  name="document"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{tipoId}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          {tipoId === "RUC" ? <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /> 
                                           : <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />}
                          <Input {...field} placeholder={tipoId === "RUC" ? "20123456789" : "12345678"} maxLength={tipoId === "RUC" ? 11 : 8} className="pl-10 h-11" disabled={isPending} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {tipoId === "RUC" && (
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Usuario</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input {...field} placeholder="Usuario SOL" className="pl-10 h-11" disabled={isPending} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="solKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clave SOL</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input {...field} type="password" placeholder="••••••••" className="pl-10 h-11" disabled={isPending} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full h-12 text-base font-medium bg-gradient-primary" disabled={isPending}>
                  {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Conectando...</> : "Continuar"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}