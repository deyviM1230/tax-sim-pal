import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { loginUser } from "@/services/auth-service";
import { LoginRequest, AuthResponse } from "@/lib/auth-schema";
import { toast } from "sonner";

export const useAuth = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: LoginRequest) => loginUser(data),
    onSuccess: (data: AuthResponse) => {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      
      toast.success("¡Bienvenido al sistema!");
      navigate("/dashboard");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};