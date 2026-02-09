import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoute = () => {
  const token = localStorage.getItem("accessToken");

  // Si no hay token, el usuario no está validado
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si hay token, permite ver la página solicitada
  return <Outlet />;
};