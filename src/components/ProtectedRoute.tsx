import { Navigate, Outlet } from "react-router-dom";
import { authClient } from "@/lib/auth-client";

export const ProtectedRoute = () => {
  // useSession verifica automáticamente si el usuario está autenticado
  const { data: session, isPending } = authClient.useSession();

  // 1. Mientras verifica, mostramos un estado de carga (opcional pero recomendado)
  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
           <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
           <p className="text-sm text-muted-foreground">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // 2. Si terminó de cargar y NO hay sesión, redirigir al login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // 3. Si hay sesión, permitir el acceso
  return <Outlet />;
};