import { api } from "./api";
import type { User, UserPreferences } from "@/store/auth.store";
import { isDemoMode } from "@/lib/demo-mode";
import { demoAuth, getDemoToken } from "@/lib/demo-auth";

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  city?: string;
  district?: string;
  location?: string;
  kecamatan?: string;
  bio?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}

export interface UpdateProfileDTO {
  name?: string;
  city?: string;
  district?: string;
  location?: string;
  kecamatan?: string;
  bio?: string;
  avatarColor?: string;
  avatarUrl?: string;
  preferences?: UserPreferences;
}

export interface ChangePasswordDTO {
  current_password: string;
  new_password?: string;
  new_password_confirmation?: string;
  password?: string;
  password_confirmation?: string;
}

function tokenOrThrow(): string {
  const token = getDemoToken();
  if (!token) throw { message: "Not signed in", errors: {} };
  return token;
}

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    if (isDemoMode) return demoAuth.login(email, password);
    return api.post<AuthResponse>("/auth/login", { email, password });
  },

  register: async (data: RegisterDTO): Promise<AuthResponse> => {
    if (isDemoMode) return demoAuth.register(data);
    return api.post<AuthResponse>("/auth/register", data);
  },

  getMe: async (): Promise<User> => {
    if (isDemoMode) return demoAuth.getMe(tokenOrThrow());
    return api.get<User>("/auth/me");
  },

  logout: async (): Promise<void> => {
    if (isDemoMode) return demoAuth.logout();
    try {
      await api.post("/auth/logout");
    } catch {
      // Logout should always succeed client-side even if API fails
    }
  },

  updateProfile: async (data: UpdateProfileDTO): Promise<User> => {
    if (isDemoMode) return demoAuth.updateProfile(tokenOrThrow(), data);
    return api.put<User>("/auth/profile", data);
  },

  uploadAvatar: async (file: File): Promise<{ avatar_url: string }> => {
    if (isDemoMode) return demoAuth.uploadAvatar(tokenOrThrow(), file);
    const formData = new FormData();
    formData.append("avatar", file);
    return api.post<{ avatar_url: string }>("/auth/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  changePassword: async (data: ChangePasswordDTO): Promise<void> => {
    if (isDemoMode) return demoAuth.changePassword(tokenOrThrow(), data);
    await api.put("/auth/password", data);
  },

  deleteAccount: async (password?: string): Promise<void> => {
    if (isDemoMode) return demoAuth.deleteAccount(tokenOrThrow());
    await api.delete("/auth/account", { data: { password } });
  },
};
