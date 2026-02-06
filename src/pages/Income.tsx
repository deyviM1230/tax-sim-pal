import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Calculator, FileText, Briefcase, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import { calculateTax, TaxCalculationResult } from "@/mocks/taxData";
import { addCalculation, getFiscalYear } from "@/mocks/calculationStore";

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

// Simulación async con TanStack Query
const simulateCalculation = async (data: IncomeFormData): Promise<TaxCalculationResult> => {
  // Simular delay de API
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return calculateTax(data.renta4ta, data.renta5ta, data.periodo4ta, data.periodo5ta);
};

export default function Income() {
  const navigate = useNavigate();

  const form = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      renta4ta: 0,
      periodo4ta: "mensual",
      renta5ta: 0,
      periodo5ta: "mensual",
    },
  });

  const fiscalYear = getFiscalYear();

  const mutation = useMutation({
    mutationFn: simulateCalculation,
    onSuccess: (data) => {
      addCalculation(data);
      navigate("/resultados", { state: { result: data } });
    },
  });

  const onSubmit = (data: IncomeFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Ingresos del Contribuyente</h1>
              <p className="text-sm text-muted-foreground">Cálculo correspondiente al año {fiscalYear}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Renta 4ta Categoría */}
            <Card className="shadow-card border-0 animate-slide-up">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <FileText className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Ingresos por Recibos por Honorarios</CardTitle>
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
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                              S/
                            </span>
                            <Input
                              {...field}
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              className="pl-10 h-11"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-muted-foreground">Si no cuentas con este tipo de ingreso, puedes dejar el campo vacío.</p>
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
                            <SelectTrigger className="h-11">
                              <SelectValue />
                            </SelectTrigger>
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
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                              S/
                            </span>
                            <Input
                              {...field}
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              className="pl-10 h-11"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-muted-foreground">Si no cuentas con este tipo de ingreso, puedes dejar el campo vacío.</p>
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
                            <SelectTrigger className="h-11">
                              <SelectValue />
                            </SelectTrigger>
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

            {/* Validation Error */}
            {form.formState.errors.root && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {form.formState.errors.root.message}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={mutation.isPending || (!form.watch("renta4ta") && !form.watch("renta5ta"))}
              className="w-full h-14 text-lg font-semibold bg-gradient-primary hover:opacity-90 transition-all shadow-lg"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Calculando...
                </>
              ) : (
                <>
                  <Calculator className="w-5 h-5 mr-2" />
                  Calcular impuesto
                </>
              )}
            </Button>
          </form>
        </Form>
      </main>
    </div>
  );
}
