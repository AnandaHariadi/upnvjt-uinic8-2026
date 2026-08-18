"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/services/auth.service";
import { prepareSessionState } from "@/lib/demo-state";
import { DEMO_ACCOUNT } from "@/lib/demo-mode";
import type { RegisterDTO, LoginDTO, AuthResponse } from "@/services/auth.service";
import type { ApiError } from "@/services/api";

export const CITIZEN_COOKIE = "pacul_token";

function persistSession(data: AuthResponse) {
  Cookies.set(CITIZEN_COOKIE, data.token, {
    expires: 7,
    sameSite: "lax",
    secure: typeof window !== "undefined" && window.location.protocol === "https:",
  });
  localStorage.setItem(CITIZEN_COOKIE, data.token);
  prepareSessionState(String(data.user.id));
}

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, logout: clearStore, setUser, updateUser } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: LoginDTO & { redirectTo?: string }) => authService.login(email, password),
    onSuccess: (data, vars) => {
      persistSession(data);
      setUser(data.user);
      toast.success(`Welcome, ${data.user.name}!`);
      router.push(vars.redirectTo ?? "/dashboard");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Incorrect email or password");
    },
  });

  /** One-click Judge Demo: signs in to the demo account with a freshly seeded, deterministic state. */
  const demoLogin = (redirectTo = "/dashboard?guide=1") =>
    loginMutation.mutateAsync({ email: DEMO_ACCOUNT.email, password: DEMO_ACCOUNT.password, redirectTo });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterDTO) => authService.register(data),
    onSuccess: (data) => {
      persistSession(data);
      setUser(data.user);
      toast.success(`Welcome to PACUL, ${data.user.name}!`);
    },
    onError: (error: ApiError) => {
      const firstError = Object.values(error.errors || {})[0]?.[0];
      toast.error(firstError || error.message || "Could not create the account. Please try again.");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      Cookies.remove(CITIZEN_COOKIE);
      localStorage.removeItem(CITIZEN_COOKIE);
      localStorage.removeItem("pacul-auth");
      clearStore();
      queryClient.clear();
      router.push("/login");
    },
  });

  return {
    user,
    isAuthenticated,
    loginMutation,
    demoLogin,
    registerMutation,
    logoutMutation,
    updateUser,
  };
}
