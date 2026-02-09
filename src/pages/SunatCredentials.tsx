import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, User, KeyRound, CreditCard, Loader2, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { authSchema, type LoginRequest } from "@/lib/auth-schema";
import { toast } from "sonner";

export default function SunatCredentials() {
  const navigate = useNavigate();
  const [tipoId, setTipoId] = useState<"RUC" | "DNI">("RUC");
  const [isLoading, setIsLoading] = useState(false);

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

  const onSubmit = async (_data: LoginRequest) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    toast.success("Credenciales SUNAT verificadas");
    navigate("/ingresos");
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Credenciales SUNAT</h1>
              <p className="text-sm text-muted-foreground">Paso 1 de 3</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-md mx-auto px-4 py-6">
        <Card className="shadow-card border-0 animate-slide-up">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Datos de acceso SUNAT</CardTitle>
            <CardDescription>Ingresa tus credenciales SOL para continuar</CardDescription>
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
                          <Input {...field} placeholder={tipoId === "RUC" ? "20123456789" : "12345678"} maxLength={tipoId === "RUC" ? 11 : 8} className="pl-10 h-11" disabled={isLoading} />
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
                            <Input {...field} placeholder="Usuario SOL" className="pl-10 h-11" disabled={isLoading} />
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
                          <Input {...field} type="password" placeholder="••••••••" className="pl-10 h-11" disabled={isLoading} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full h-12 text-base font-medium bg-gradient-primary" disabled={isLoading}>
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verificando...</> : "Continuar"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
