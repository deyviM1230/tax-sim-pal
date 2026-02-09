import { useNavigate } from "react-router-dom";
import { Calculator, Plus, Eye, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCalculations, getFiscalYear, SavedCalculation } from "@/mocks/calculationStore";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(amount);
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-slide-up">
      <div className="p-4 rounded-full bg-primary/10 mb-6">
        <FileText className="w-10 h-10 text-primary" />
      </div>
      <h2 className="text-xl font-semibold text-foreground mb-2">Aún no tienes cálculos registrados</h2>
      <p className="text-muted-foreground mb-8 max-w-sm">
        Realiza tu primera simulación de impuesto a la renta para ver los resultados aquí.
      </p>
      <Button
        onClick={onNew}
        size="lg"
        className="h-14 px-8 text-lg font-semibold bg-gradient-primary hover:opacity-90 transition-all shadow-lg gap-2"
      >
        <Plus className="w-5 h-5" />
        Nuevo cálculo
      </Button>
    </div>
  );
}

function CalculationTable({ items, onView }: { items: SavedCalculation[]; onView: (c: SavedCalculation) => void }) {
  return (
    <div className="animate-slide-up">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Año</TableHead>
            <TableHead>Honorarios</TableHead>
            <TableHead>Planilla</TableHead>
            <TableHead>Resultado</TableHead>
            <TableHead className="text-right">Acción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((calc) => (
            <TableRow key={calc.id}>
              <TableCell className="font-medium">{calc.year}</TableCell>
              <TableCell>{formatCurrency(calc.renta4taAnual)}</TableCell>
              <TableCell>{formatCurrency(calc.renta5taAnual)}</TableCell>
              <TableCell>
                <Badge variant={calc.tipoSaldo === "favor" ? "destructive" : "destructive"} className={calc.tipoSaldo === "favor" ? "bg-[hsl(0,100%,35%)] text-white font-bold" : ""}>
                  {calc.tipoSaldo === "favor" ? "Te roban" : "A pagar"} {formatCurrency(calc.saldoFinal)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => onView(calc)} className="gap-1">
                  <Eye className="w-4 h-4" />
                  Ver detalle
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const calculations = getCalculations();
  const fiscalYear = getFiscalYear();

  const handleView = (calc: SavedCalculation) => {
    navigate("/resultados", { state: { result: calc.result } });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-primary">
              <Calculator className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Sunat CTM</h1>
              <p className="text-sm text-muted-foreground">
                Cálculo correspondiente al año {fiscalYear}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto px-4 py-6 space-y-6">
        <Card className="shadow-card border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Mis cálculos de impuesto</CardTitle>
                <CardDescription>Historial de simulaciones realizadas</CardDescription>
              </div>
              {calculations.length > 0 && (
                <Button
                  onClick={() => navigate("/sunat")}
                  className="bg-gradient-primary hover:opacity-90 transition-opacity gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Nuevo cálculo
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {calculations.length === 0 ? (
              <EmptyState onNew={() => navigate("/sunat")} />
            ) : (
              <CalculationTable items={calculations} onView={handleView} />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
