import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Wallet, AlertTriangle } from "lucide-react";
import { UIT } from "@/mocks/taxData";

interface ExpenseCategory {
  label: string;
  amount: number;
  colorClass: string;
}

interface ExpenseBarProps {
  gastosDeducibles: {
    hotelesRestaurantes: number;
    serviciosProfesionales: number;
    arrendamiento: number;
    trabajadorasHogar: number;
    total: number;
  };
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(amount);
}

const MAX_DEDUCTIBLE = 3 * UIT;

export default function ExpenseBar({ gastosDeducibles }: ExpenseBarProps) {
  const categories: ExpenseCategory[] = [
    { label: "Hoteles y Restaurantes", amount: gastosDeducibles.hotelesRestaurantes, colorClass: "bg-chart-1" },
    { label: "Servicios Profesionales", amount: gastosDeducibles.serviciosProfesionales, colorClass: "bg-chart-2" },
    { label: "Arrendamiento", amount: gastosDeducibles.arrendamiento, colorClass: "bg-chart-3" },
    { label: "Trabajadoras del Hogar", amount: gastosDeducibles.trabajadorasHogar, colorClass: "bg-chart-4" },
  ];

  const totalUsed = gastosDeducibles.total;
  const usagePercent = Math.min((totalUsed / MAX_DEDUCTIBLE) * 100, 100);
  const isAtLimit = totalUsed >= MAX_DEDUCTIBLE;

  return (
    <Card className="shadow-card border-0 animate-slide-up" style={{ animationDelay: "0.25s" }}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Wallet className="w-5 h-5 text-primary" />
          Gastos Deducibles
        </CardTitle>
        <CardDescription>
          {formatCurrency(totalUsed)} de {formatCurrency(MAX_DEDUCTIBLE)} utilizados ({usagePercent.toFixed(1)}%)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Storage-style bar */}
        <TooltipProvider delayDuration={100}>
          <div className="w-full h-8 rounded-full bg-secondary overflow-hidden flex">
            {categories.map((cat) => {
              const pct = (cat.amount / MAX_DEDUCTIBLE) * 100;
              if (pct <= 0) return null;
              return (
                <Tooltip key={cat.label}>
                  <TooltipTrigger asChild>
                    <div
                      className={`${cat.colorClass} h-full transition-all duration-500 cursor-pointer hover:opacity-80`}
                      style={{ width: `${pct}%` }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-semibold">{cat.label}</p>
                    <p>{formatCurrency(cat.amount)} — {pct.toFixed(1)}%</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-3">
          {categories.map((cat) => {
            const pct = (cat.amount / MAX_DEDUCTIBLE) * 100;
            return (
              <div key={cat.label} className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-sm shrink-0 ${cat.colorClass}`} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{cat.label}</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(cat.amount)} · {pct.toFixed(1)}%</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Limit warning */}
        {isAtLimit && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 text-destructive px-4 py-3 text-sm font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            Has alcanzado el tope máximo de gastos deducibles (3 UIT)
          </div>
        )}

        {/* Help text */}
        <p className="text-xs text-muted-foreground text-center">
          Gastos deducibles aplicados hasta un máximo de 3 UIT según normativa.
        </p>
      </CardContent>
    </Card>
  );
}
