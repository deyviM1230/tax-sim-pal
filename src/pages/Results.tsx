import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, CheckCircle2, XCircle, Receipt, Building2, Percent, Calculator } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TaxCalculationResult, UIT } from "@/mocks/taxData";
import { useEffect } from "react";
import ExpenseBar from "@/components/ExpenseBar";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(amount);
}

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result as TaxCalculationResult | undefined;

  useEffect(() => {
    if (!result) {
      navigate("/");
    }
  }, [result, navigate]);

  if (!result) {
    return null;
  }

  const isFavor = result.tipoSaldo === "favor";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
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
                <h1 className="text-lg font-semibold text-foreground">Detalle del Cálculo</h1>
                <p className="text-sm text-muted-foreground">Ejercicio fiscal 2024</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Resultado Principal */}
        <Card
          className={`shadow-card border-0 overflow-hidden animate-slide-up ${
            isFavor ? "bg-gradient-success" : "bg-gradient-destructive"
          }`}
        >
          <CardContent className="p-6 text-center text-primary-foreground">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-foreground/20 mb-4">
              {isFavor ? (
                <CheckCircle2 className="w-8 h-8" />
              ) : (
                <XCircle className="w-8 h-8" />
              )}
            </div>
            <p className="text-sm font-medium opacity-90 uppercase tracking-wide mb-1">
              {isFavor ? "Saldo a favor del contribuyente" : "Saldo a pagar a SUNAT"}
            </p>
            <p className="text-4xl font-bold mb-2">{formatCurrency(result.saldoFinal)}</p>
            <p className="text-sm opacity-80">
              {isFavor
                ? "Puedes solicitar devolución"
                : "Debes regularizar este monto"}
            </p>
          </CardContent>
        </Card>

        {/* Ingresos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="shadow-card border-0 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-accent">
                <Receipt className="w-4 h-4" />
                <CardDescription className="text-accent font-medium">Ingresos por Recibos por Honorarios</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(result.renta4taAnual)}</p>
              <p className="text-sm text-muted-foreground">Anualizado</p>
            </CardContent>
          </Card>

          <Card className="shadow-card border-0 animate-slide-up" style={{ animationDelay: "0.15s" }}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-primary">
                <Building2 className="w-4 h-4" />
                <CardDescription className="text-primary font-medium">Ingresos en Planilla</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(result.renta5taAnual)}</p>
              <p className="text-sm text-muted-foreground">Anualizado</p>
            </CardContent>
          </Card>
        </div>

        {/* Deducciones */}
        <Card className="shadow-card border-0 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Percent className="w-5 h-5 text-primary" />
              Deducciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-foreground">Deducción 4ta (20%)</p>
                <p className="text-sm text-muted-foreground">20% de ingresos por honorarios</p>
              </div>
              <p className="font-semibold text-foreground">{formatCurrency(result.deduccion4ta)}</p>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-foreground">Deducción fija (7 UIT)</p>
                <p className="text-sm text-muted-foreground">UIT 2024: {formatCurrency(UIT)}</p>
              </div>
              <p className="font-semibold text-foreground">{formatCurrency(result.deduccionFija)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Gastos Deducibles - Storage Bar */}
        <ExpenseBar gastosDeducibles={result.gastosDeducibles} />

        {/* Resumen del Cálculo */}
        <Card className="shadow-card border-0 animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              Resumen del Cálculo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-muted-foreground">Renta Neta Imponible</p>
              <p className="font-medium text-foreground">{formatCurrency(result.rentaNetaImponible)}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-muted-foreground">Impuesto Calculado</p>
              <p className="font-medium text-foreground">{formatCurrency(result.impuestoCalculado)}</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-muted-foreground">Total Retenciones</p>
              <p className="font-medium text-success">- {formatCurrency(result.totalRetenciones)}</p>
            </div>
            <Separator />
            <div className="flex justify-between items-center pt-2">
              <p className="font-semibold text-foreground">
                {isFavor ? "Saldo a Favor" : "Saldo a Pagar"}
              </p>
              <p className={`text-xl font-bold ${isFavor ? "text-success" : "text-destructive"}`}>
                {formatCurrency(result.saldoFinal)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Botón Nueva Simulación */}
        <Button
          onClick={() => navigate("/dashboard")}
          variant="outline"
          className="w-full h-12"
        >
          Nueva simulación
        </Button>
      </main>
    </div>
  );
}
