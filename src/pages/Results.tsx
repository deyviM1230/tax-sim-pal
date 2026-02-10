import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, CheckCircle2, XCircle, Receipt, Building2, Calculator, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ExpenseBar from "@/components/ExpenseBar";
import { useCalculationStore } from "@/stores/useCalculationStore";
import { toast } from "sonner";
import { api } from "@/lib/axios";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(amount);
}

// 1. Definimos la estructura REAL que te manda tu backend
interface BackendTaxResult {
  professionalFeesIncome: string; // 4ta Categoría
  payrollIncome: string;          // 5ta Categoría
  calculatedTax: string;          // Impuesto Calculado
  fifthCategoryWithholding: string; // Retenciones
  taxDifference: string;          // Diferencia (Saldo a favor o pagar)
  deductibleExpenses: string;     // Gastos Deducibles (El total)
}

export default function Results() {
  const navigate = useNavigate();
  const { taxProfile } = useCalculationStore();
  
  const [status, setStatus] = useState<"connecting" | "calculating" | "finished" | "error">("connecting");
  const [result, setResult] = useState<BackendTaxResult | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!taxProfile) {
      navigate("/nuevo-calculo");
    }
  }, [taxProfile, navigate]);

  useEffect(() => {
    if (!taxProfile) return;

    const serverUrl = import.meta.env.VITE_API_URL || "";
    // Cambiamos http(s) por ws(s)
    const wsProtocol = serverUrl.startsWith("https") ? "wss" : "ws";
    const wsDomain = serverUrl.replace(/^https?:\/\//, "");
    const url = serverUrl ? `${wsProtocol}://${wsDomain}/ws` : `ws://${window.location.host}/ws`;

    const socket = new WebSocket(url);
    socketRef.current = socket;

    const handleOpen = async () => {
      console.log("WS conectado, iniciando cálculo...");
      setStatus("calculating");

      try {
        const res = await api.get("/tax/init-calculation");
        console.log("Respuesta del servidor al iniciar cálculo:", res.data);
      } catch (err) {
        console.error("Error iniciando cálculo", err);
        setStatus("error");
        toast.error("No se pudo iniciar el cálculo.");
      }
    };

const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Datos del WS recibidos:", data);
        
        // Verificamos que sea el mensaje de éxito (SYNC_SUCCESS) y que traiga el payload
        if (data.type === "SYNC_SUCCESS" && data.payload && data.payload.calculation) {
          
          // Extraemos SOLAMENTE la parte de "calculation" que tiene los números
          const calculationData = data.payload.calculation;
          
          setResult(calculationData as BackendTaxResult);
          setStatus("finished");
          toast.success("¡Cálculo finalizado!");
        }
      } catch (e) {
        console.error("Mensaje WS inválido", e);
      }
    };
    const handleError = () => {
      if (status !== "finished") {
        setStatus("error");
        toast.error("Error de conexión con el servidor.");
      }
    };

    socket.addEventListener("open", handleOpen);
    socket.addEventListener("message", handleMessage);
    socket.addEventListener("error", handleError);

    return () => {
      socket.removeEventListener("open", handleOpen);
      socket.removeEventListener("message", handleMessage);
      socket.removeEventListener("error", handleError);

      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [taxProfile]);

  // --- VISTAS DE CARGA Y ERROR ---
  if (status === "connecting" || status === "calculating") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <h2 className="text-2xl font-bold mb-2">Procesando Declaración...</h2>
        <p className="text-muted-foreground">Conectando con el servidor de cálculo.</p>
      </div>
    );
  }

  if (status === "error" || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive flex gap-2"><AlertCircle /> Error</CardTitle>
            <CardDescription>No se pudo completar el cálculo.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" /> Reintentar
            </Button>
            <Button onClick={() => navigate("/ingresos")} variant="ghost" className="w-full mt-2">
              Volver a Ingresos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- MAPEO DE DATOS DEL BACKEND ---
  // Convertimos los strings del backend ("12000.00") a números (12000)
  const taxDifferenceNum = Number(result.taxDifference) || 0;
  
  // Lógica de favor/contra: Si la diferencia es NEGATIVA, SUNAT nos debe (Favor)
  const isFavor = taxDifferenceNum < 0; 
  // Mostramos el valor siempre en positivo (Math.abs) porque el color y texto ya indican si es deuda o devolución
  const saldoFinalVisual = Math.abs(taxDifferenceNum);

  // Armamos el objeto para ExpenseBar. Ponemos todo en 0 excepto el total general que viene del backend
  const gastosDeduciblesBackend = {
    hotelesRestaurantes: 0,
    serviciosProfesionales: 0,
    arrendamiento: 0,
    trabajadorasHogar: 0,
    total: Number(result.deductibleExpenses) || 0
  };

  return (
    <div className="min-h-screen bg-background p-4">
        <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10 mb-6">
            <div className="container max-w-3xl mx-auto py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-lg font-semibold">Detalle del Cálculo</h1>
                        <p className="text-sm text-muted-foreground">Resultados en tiempo real</p>
                    </div>
                </div>
            </div>
        </header>

        <main className="container max-w-3xl mx-auto space-y-6">
            
            {/* Tarjeta Principal (Saldo a favor o en contra) */}
            <Card className={`border-0 shadow-lg ${isFavor ? "bg-green-600" : "bg-red-600"} text-white`}>
                <CardContent className="p-6 text-center">
                    {isFavor ? <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-90"/> : <XCircle className="w-12 h-12 mx-auto mb-2 opacity-90"/>}
                    <p className="text-sm font-medium uppercase tracking-wide opacity-90">
                        {isFavor ? "Saldo a Favor del Contribuyente" : "Impuesto a Regularizar"}
                    </p>
                    <p className="text-4xl font-bold my-2">{formatCurrency(saldoFinalVisual)}</p>
                    <p className="text-sm opacity-80">
                        {isFavor ? "Monto sujeto a devolución" : "Debe pagar este monto a la SUNAT"}
                    </p>
                </CardContent>
            </Card>

            {/* Ingresos 4ta y 5ta */}
            <div className="grid md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Rentas 4ta Categ.</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            <Receipt className="w-5 h-5 text-primary"/>
                            {formatCurrency(Number(result.professionalFeesIncome) || 0)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Monto Anual de Panilla</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-primary"/>
                            {formatCurrency(Number(result.payrollIncome) || 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Gastos Deducibles con el total del backend */}
            <ExpenseBar gastosDeducibles={gastosDeduciblesBackend} />

            {/* Resumen Final */}
            <Card>
                <CardHeader><CardTitle>Resumen Final</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-between">
                        <span>Impuesto Calculado</span>
                        <span className="font-medium">{formatCurrency(Number(result.calculatedTax) || 0)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                        <span>Retenciones Previas (5ta)</span>
                        <span>- {formatCurrency(Number(result.fifthCategoryWithholding) || 0)}</span>
                    </div>
                    <Separator className="my-2"/>
                    <div className="flex justify-between text-lg font-bold">
                        <span>{isFavor ? "Devolución" : "Total a Pagar"}</span>
                        <span className={isFavor ? "text-green-600" : "text-red-600"}>
                            {formatCurrency(saldoFinalVisual)}
                        </span>
                    </div>
                </CardContent>
            </Card>

            <Button onClick={() => navigate("/dashboard")} variant="outline" className="w-full h-12">
                Nueva Simulación
            </Button>
        </main>
    </div>
  );
}