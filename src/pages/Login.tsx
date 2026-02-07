import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, User, KeyRound, CreditCard } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const rucSchema = z.object({
  tipoIdentificacion: z.literal("RUC"),
  ruc: z.string().length(11, "El RUC debe tener 11 dígitos").regex(/^\d+$/, "Solo números"),
  usuario: z.string().min(1, "Usuario requerido"),
  claveSol: z.string().min(1, "Clave SOL requerida"),
});

const dniSchema = z.object({
  tipoIdentificacion: z.literal("DNI"),
  dni: z.string().length(8, "El DNI debe tener 8 dígitos").regex(/^\d+$/, "Solo números"),
  claveSol: z.string().min(1, "Clave SOL requerida"),
});

const loginSchema = z.discriminatedUnion("tipoIdentificacion", [rucSchema, dniSchema]);

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const [tipoId, setTipoId] = useState<"RUC" | "DNI">("RUC");

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      tipoIdentificacion: "RUC",
      ruc: "",
      usuario: "",
      claveSol: "",
    } as LoginFormData,
  });

  const handleTipoChange = (value: "RUC" | "DNI") => {
    setTipoId(value);
    if (value === "RUC") {
      form.reset({ tipoIdentificacion: "RUC", ruc: "", usuario: "", claveSol: "" });
    } else {
      form.reset({ tipoIdentificacion: "DNI", dni: "", claveSol: "" });
    }
  };

  const onSubmit = (data: LoginFormData) => {
    console.log("Login:", data);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary mb-4">
            <Building2 className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Sunat CTM</h1>
          <p className="text-muted-foreground mt-1">Simulador de Impuesto a la Renta</p>
        </div>

        <Card className="shadow-card border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Iniciar sesión</CardTitle>
            <CardDescription>
              Ingresa tus credenciales para continuar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Tipo de identificación */}
                <div className="space-y-2">
                  <Label>Tipo de identificación</Label>
                  <Select value={tipoId} onValueChange={handleTipoChange}>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RUC">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          RUC
                        </div>
                      </SelectItem>
                      <SelectItem value="DNI">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          DNI
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {tipoId === "RUC" ? (
                  <>
                    <FormField
                      control={form.control}
                      name="ruc"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>RUC</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                {...field}
                                placeholder="20123456789"
                                maxLength={11}
                                className="pl-10 h-11"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="usuario"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Usuario</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                {...field}
                                placeholder="Usuario SOL"
                                className="pl-10 h-11"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                ) : (
                  <FormField
                    control={form.control}
                    name="dni"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>DNI</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              {...field}
                              placeholder="12345678"
                              maxLength={8}
                              className="pl-10 h-11"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="claveSol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clave SOL</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            {...field}
                            type="password"
                            placeholder="••••••••"
                            className="pl-10 h-11"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full h-12 text-base font-medium bg-gradient-primary hover:opacity-90 transition-opacity">
                  Continuar
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Simulador educativo • Sin autenticación real
        </p>
      </div>
    </div>
  );
}
