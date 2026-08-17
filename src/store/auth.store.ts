import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserPreferences {
  notifications: boolean;
  publicProfile: boolean;
  weeklyReport: boolean;
  badgeNotifications: boolean;
}

export interface User {
  id: number | string;
  name: string;
  email: string;
  city?: string;
  district?: string;
  avatar_url?: string;
  avatarUrl?: string;
  streak_days?: number;
  role?: string;
  government_unit?: string;
  // Computed/frontend-only fields
  avatarInitials?: string;
  location?: string;
  kecamatan?: string;
  bio?: string;
  avatarColor?: string;
  isVerified?: boolean;
  joinedAt?: string;
  preferences?: UserPreferences;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
  setUser: (user: User) => void;
  updateUser: (partial: Partial<User>) => void;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  notifications: true,
  publicProfile: true,
  weeklyReport: true,
  badgeNotifications: true,
};

function makeInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      logout: () =>
        set({ user: null, isAuthenticated: false, isLoading: false }),

      setUser: (user) =>
        set({
          user: {
            ...user,
            avatarInitials: user.avatarInitials || makeInitials(user.name),
            location: user.location ?? user.city ?? "",
            kecamatan: user.kecamatan ?? user.district ?? "",
            preferences: user.preferences ?? DEFAULT_PREFERENCES,
          },
          isAuthenticated: true,
        }),

      updateUser: (partial) =>
        set((state) =>
          state.user ? { user: { ...state.user, ...partial } } : {}
        ),
    }),
    {
      name: "pacul-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
