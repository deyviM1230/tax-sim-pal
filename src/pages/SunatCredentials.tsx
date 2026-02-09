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
import { useCalculationStore } from "@/stores/useCalculationStore";

export default function SunatCredentials() {
  const navigate = useNavigate();
  const setTaxProfile = useCalculationStore((state) => state.setTaxProfile);
  
  const [tipoId, setTipoId] = useState<"RUC" | "DNI">("RUC");
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginRequest>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      documentType: "RUC",
      document: "",
      username: "",
      solkey: "", // Cambio: solkey (minúscula)
    } as any, // 'as any' inicial para evitar conflictos de union en el default
  });

  const handleTipoChange = (value: "RUC" | "DNI") => {
    setTipoId(value);
    
    if (value === "RUC") {
      // Caso RUC: Incluimos username
      form.reset({ 
        documentType: "RUC", 
        document: "", 
        username: "", 
        solkey: "" 
      });
    } else {
      // Caso DNI: NO incluimos username para evitar el error de TS
      form.reset({ 
        documentType: "DNI", 
        document: "", 
        solkey: "" 
      });
    }
  };

  const onSubmit = async (data: LoginRequest) => {
    setIsLoading(true);
    try {
      // Guardamos en el store con la estructura correcta
      setTaxProfile({
        documentType: data.documentType,
        document: data.document,
        // TypeScript sabe que si es RUC existe username
        username: data.documentType === "RUC" ? data.username : undefined,
        solkey: data.solkey // Mapeamos solkey del form al store
      });

      toast.success("Datos guardados temporalmente");
      navigate("/ingresos");
    } catch (error) {
      toast.error("Error al procesar los datos");
    } finally {
      setIsLoading(false);
    }
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
              <p className="text-sm text-muted-foreground">Paso 1 de 2</p>
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
                
                {/* Selector de Tipo */}
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

                {/* Campo Documento */}
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

                {/* Campo Usuario (Solo RUC) */}
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

                {/* Campo Clave SOL (solkey) */}
                <FormField
                  control={form.control}
                  name="solkey" // Cambio: solkey (minúscula)
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
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</> : "Continuar"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}