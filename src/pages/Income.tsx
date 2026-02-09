import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Calculator, FileText, Briefcase, Loader2, Send, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCalculationStore } from "@/stores/useCalculationStore";
import { toast } from "sonner";
import axios from "axios"; // <--- Importamos Axios

// Esquema de validación
const incomeSchema = z.object({
  renta4ta: z.coerce.number().min(0, "Debe ser mayor o igual a 0"),
  periodo4ta: z.enum(["mensual", "anual"]),
  renta5ta: z.coerce.number().min(0, "Debe ser mayor o igual a 0"),
  periodo5ta: z.enum(["mensual", "anual"]),
}).refine((data) => data.renta4ta > 0 || data.renta5ta > 0, {
  message: "Debes ingresar al menos un tipo de ingreso: honorarios o planilla.",
  path: ["root"],
});

type IncomeFormData = z.infer<typeof incomeSchema>;

export default function Income() {
  const navigate = useNavigate();
  const { taxProfile } = useCalculationStore();
  
  const [isSending, setIsSending] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  // Validación de acceso
  if (!taxProfile) {
    navigate("/nuevo-calculo"); 
    return null;
  }

  const form = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      renta4ta: 0,
      periodo4ta: "mensual",
      renta5ta: 0,
      periodo5ta: "mensual",
    },
  });

  // Construcción del Payload
  const buildPayload = (data: IncomeFormData) => {
    const userIncomeTypesDto = [];

    if (data.renta4ta > 0) {
      userIncomeTypesDto.push({
        incomeType: "PROFESSIONAL_FEES",
        periodIncomeType: data.periodo4ta === "mensual" ? "MONTHLY" : "ANNUAL",
        income: data.renta4ta
      });
    }

    if (data.renta5ta > 0) {
      userIncomeTypesDto.push({
        incomeType: "PAYROLL",
        periodIncomeType: data.periodo5ta === "mensual" ? "MONTHLY" : "ANNUAL",
        income: data.renta5ta
      });
    }

    const userTaxProfileDto = {
      documentType: taxProfile.documentType,
      document: taxProfile.document,
      ...(taxProfile.documentType === "RUC" && { username: taxProfile.username }),
      [taxProfile.documentType === "DNI" ? "solkey" : "solKey"]: taxProfile.solkey
    };

    return { userTaxProfileDto, userIncomeTypesDto };
  };

  // --- LÓGICA 1: MANDAR DATOS CON AXIOS ---
  const handleSendData = async (data: IncomeFormData) => {
    setIsSending(true);
    try {
      const payload = buildPayload(data);
      console.log("Enviando datos:", payload);

      // Usamos ruta relativa para aprovechar el Proxy de Vite
      const response = await axios.post("/api/auth/user-data", payload);

      // Axios lanza error si status no es 2xx, así que si llegamos aquí, fue un éxito.
      // Validamos la respuesta específica de tu backend
      const result = response.data;
      const isSuccess = result === true || result?.success === true;

      if (isSuccess) {
        toast.success("¡Datos registrados correctamente!");
      } else {
        toast.error("El servidor indicó que no se pudieron guardar los datos.");
      }
    } catch (error: any) {
      console.error("Error Axios:", error);
      
      // Manejo de errores específico de Axios
      if (error.response) {
        // El servidor respondió con un código de error (4xx, 5xx)
        toast.error(`Error del servidor: ${error.response.data?.message || error.response.statusText}`);
      } else if (error.request) {
        // No hubo respuesta (servidor caído o timeout)
        toast.error("El servidor no responde. Verifica que el backend esté encendido.");
      } else {
        toast.error("Error al preparar la solicitud.");
      }
    } finally {
      setIsSending(false);
    }
  };

  // --- LÓGICA 2: CALCULAR IMPUESTO CON AXIOS ---
  const handleCalculate = async (data: IncomeFormData) => {
    setIsCalculating(true);
    try {
        const payload = buildPayload(data);

        // Llamada para iniciar cálculo
        await axios.post("/api/tax/init-calculation", payload);
        
        toast.info("Cálculo iniciado. Conectando...");
        navigate("/resultados");

    } catch (error: any) {
        console.error("Error cálculo:", error);
        if (error.response) {
            toast.error(`Error al iniciar cálculo: ${error.response.data?.message || "Error desconocido"}`);
        } else {
            toast.error("No se pudo conectar para iniciar el cálculo.");
        }
    } finally {
        setIsCalculating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/nuevo-calculo")} className="shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Ingresos del Contribuyente</h1>
              <p className="text-sm text-muted-foreground">Paso 2 de 2</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        <Form {...form}>
          <form className="space-y-6">
            
            {/* Renta 4ta Categoría */}
            <Card className="shadow-card border-0 animate-slide-up">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <FileText className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Recibos por Honorarios</CardTitle>
                    <CardDescription>Rentas de 4ta categoría</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="renta4ta"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monto (S/)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">S/</span>
                            <Input {...field} type="number" min="0" step="0.01" className="pl-10 h-11" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="periodo4ta"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Período</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="mensual">Mensual</SelectItem>
                            <SelectItem value="anual">Anual</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Renta 5ta Categoría */}
            <Card className="shadow-card border-0 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Briefcase className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Ingresos en Planilla</CardTitle>
                    <CardDescription>Rentas de 5ta categoría</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="renta5ta"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sueldo bruto (S/)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">S/</span>
                            <Input {...field} type="number" min="0" step="0.01" className="pl-10 h-11" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="periodo5ta"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Período</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="mensual">Mensual</SelectItem>
                            <SelectItem value="anual">Anual</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Errores */}
            {form.formState.errors.root && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {form.formState.errors.root.message}
              </div>
            )}

            {/* BOTONES */}
            <div className="space-y-3 pt-2">
                <Button
                    type="button" 
                    onClick={form.handleSubmit(handleSendData)}
                    disabled={isSending || isCalculating}
                    variant="outline"
                    className="w-full h-12 text-base font-medium border-primary/20 hover:bg-primary/5 text-primary"
                >
                    {isSending ? (
                        <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Registrando...</>
                    ) : (
                        <><Send className="w-5 h-5 mr-2" /> Mandar Datos</>
                    )}
                </Button>

                <Button
                    type="button"
                    onClick={form.handleSubmit(handleCalculate)}
                    disabled={isSending || isCalculating}
                    className="w-full h-14 text-lg font-semibold bg-gradient-primary hover:opacity-90 shadow-lg"
                >
                    {isCalculating ? (
                        <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Iniciando...</>
                    ) : (
                        <><Calculator className="w-5 h-5 mr-2" /> Calcular Impuesto</>
                    )}
                </Button>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}