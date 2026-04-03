import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api";
import { useAuthStore } from "../store/authStore";
import type { LoginForm, RegisterForm } from "../types/auth";

export const useLogin = () => {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: LoginForm) => authApi.login(payload),
    onSuccess: (data) => {
      setAuth(data.access_token, data.user);
      navigate("/");
    },
  });
};

export const useRegister = () => {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: RegisterForm) => authApi.register(payload),
    onSuccess: (data) => {
      setAuth(data.access_token, data.user);
      navigate("/");
    },
  });
};

export const useLogout = () => {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  return () => {
    logout();
    navigate("/login");
  };
};
