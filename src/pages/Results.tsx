import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, CheckCircle2, XCircle, Receipt, Building2, Percent, Calculator, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { type TaxCalculationResult, UIT } from "@/mocks/taxData"; // Asegúrate de que los tipos existan o defínelos aquí
import ExpenseBar from "@/components/ExpenseBar";
import { useCalculationStore } from "@/stores/useCalculationStore";
import { toast } from "sonner";
import axios from "axios";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(amount);
}

// Valores por defecto para evitar errores si el backend manda nulos
const defaultGastos = {
  hotelesRestaurantes: 0,
  serviciosProfesionales: 0,
  arrendamiento: 0,
  trabajadorasHogar: 0,
  total: 0
};

export default function Results() {
  const navigate = useNavigate();
  const { taxProfile } = useCalculationStore();
  
  // Estados del proceso
  const [status, setStatus] = useState<"connecting" | "calculating" | "finished" | "error">("connecting");
  const [result, setResult] = useState<TaxCalculationResult | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  // 1. Seguridad: Si no hay datos previos, volver al inicio
  useEffect(() => {
    if (!taxProfile) {
      navigate("/nuevo-calculo");
    }
  }, [taxProfile, navigate]);

  // 2. LÓGICA PRINCIPAL: Conectar WS -> Pedir Cálculo (GET)
  useEffect(() => {
    if (!taxProfile) return;

    // Detectar protocolo seguro (wss si es https, ws si es http)
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    console.log("Conectando WS:", wsUrl);
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket Conectado. Iniciando petición GET...");
      setStatus("calculating");
      
      // AQUÍ ESTÁ EL GET QUE FALTABA
      axios.get("/api/tax/init-calculation")
        .then(() => {
            console.log("Orden de cálculo enviada correctamente");
        })
        .catch(error => {
          console.error("Error al iniciar cálculo:", error);
          setStatus("error");
          toast.error("No se pudo iniciar el cálculo en el servidor.");
        });
    };

    socket.onmessage = (event) => {
      console.log("Respuesta recibida:", event.data);
      try {
        const data = JSON.parse(event.data);
        
        if (data) {
          setResult(data as TaxCalculationResult);
          setStatus("finished");
          toast.success("¡Cálculo finalizado!");
        }
      } catch (error) {
        console.error("Error leyendo respuesta:", error);
      }
    };

    socket.onerror = (error) => {
      console.error("Error WebSocket:", error);
      // No marcamos error inmediatamente para dar chance a reconexión si fuera el caso,
      // pero para este flujo simple, mejor avisar.
      if (status !== "finished") {
          setStatus("error");
          toast.error("Error de conexión con el simulador.");
      }
    };

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [taxProfile]); // Se ejecuta al montar el componente

  // --- VISTAS ---

  // A) Cargando
  if (status === "connecting" || status === "calculating") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <h2 className="text-2xl font-bold mb-2">Procesando Declaración...</h2>
        <p className="text-muted-foreground">Conectando con el servidor de cálculo.</p>
      </div>
    );
  }

  // B) Error
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

  // C) Resultado (Tu diseño original)
  const isFavor = result.tipoSaldo === "favor";

  return (
    <div className="min-h-screen bg-background p-4">
        {/* Tu Header Original */}
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
                <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2"/> Exportar</Button>
            </div>
        </header>

        <main className="container max-w-3xl mx-auto space-y-6">
            <Card className={`border-0 shadow-lg ${isFavor ? "bg-green-600" : "bg-red-600"} text-white`}>
                <CardContent className="p-6 text-center">
                    {isFavor ? <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-90"/> : <XCircle className="w-12 h-12 mx-auto mb-2 opacity-90"/>}
                    <p className="text-sm font-medium uppercase tracking-wide opacity-90">
                        {isFavor ? "Saldo a Favor del Contribuyente" : "Impuesto a Regularizar"}
                    </p>
                    <p className="text-4xl font-bold my-2">{formatCurrency(result.saldoFinal)}</p>
                    <p className="text-sm opacity-80">
                        {isFavor ? "Monto sujeto a devolución" : "Debe pagar este monto a la SUNAT"}
                    </p>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Rentas 4ta Categ.</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            <Receipt className="w-5 h-5 text-primary"/>
                            {formatCurrency(result.renta4taAnual || 0)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Rentas 5ta Categ.</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-primary"/>
                            {formatCurrency(result.renta5taAnual || 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Aquí usamos el defaultGastos para evitar el error de TypeScript */}
            <ExpenseBar gastosDeducibles={result.gastosDeducibles || defaultGastos} />

            <Card>
                <CardHeader><CardTitle>Resumen Final</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-between">
                        <span>Impuesto Calculado</span>
                        <span className="font-medium">{formatCurrency(result.impuestoCalculado || 0)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                        <span>Retenciones Previas</span>
                        <span>- {formatCurrency(result.totalRetenciones || 0)}</span>
                    </div>
                    <Separator className="my-2"/>
                    <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className={isFavor ? "text-green-600" : "text-red-600"}>{formatCurrency(result.saldoFinal)}</span>
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