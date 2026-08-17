import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/services/api";
import { isDemoMode } from "@/lib/demo-mode";
import { demoAuth } from "@/lib/demo-auth";
import Cookies from "js-cookie";

/** Government sessions use their own cookie so they never replace a citizen session. */
export const GOV_COOKIE = "pacul_gov_token";

function setGovCookie(token: string) {
  Cookies.set(GOV_COOKIE, token, {
    expires: 1,
    sameSite: "strict",
    secure: typeof window !== "undefined" && window.location.protocol === "https:",
  });
}

export interface GovUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "government";
  government_unit: string;
  governmentUnit?: string;
  avatar_url?: string;
  avatarInitials?: string;
}

interface GovAuthStore {
  user: GovUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  setUser: (user: GovUser) => void;
}

function sanitizeGovUser(u: GovUser): GovUser {
  const isOldDemo =
    u.name === "Demo Officer" ||
    u.government_unit?.includes("Demo") ||
    u.government_unit?.includes("prototype") ||
    u.governmentUnit?.includes("Demo") ||
    u.governmentUnit?.includes("prototype");

  if (isOldDemo) {
    return {
      ...u,
      name: "Ir. Hendro Gunawan, M.Si",
      government_unit: "Dinas Lingkungan Hidup Kota Surabaya",
      governmentUnit: "Dinas Lingkungan Hidup Kota Surabaya",
      avatarInitials: "HG",
    };
  }
  return u;
}

export const useGovAuthStore = create<GovAuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (email, password) => {
        try {
          if (isDemoMode) {
            const response = await demoAuth.govLogin(email, password);
            setGovCookie(response.token);
            const u = sanitizeGovUser(response.user);
            set({
              user: {
                ...u,
                governmentUnit: u.governmentUnit ?? u.government_unit,
                avatarInitials: u.avatarInitials ?? u.name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase(),
              },
              isAuthenticated: true,
            });
            return { success: true };
          }

          const response = await api.post<{ user: GovUser; token: string }>("/auth/gov/login", {
            email,
            password,
          });

          setGovCookie(response.token);

          const u = sanitizeGovUser(response.user);
          set({
            user: {
              ...u,
              governmentUnit: u.governmentUnit ?? u.government_unit,
              avatarInitials: u.avatarInitials ?? u.name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase(),
            },
            isAuthenticated: true,
          });
          return { success: true };
        } catch (err: unknown) {
          const error = err as { message?: string };
          return {
            success: false,
            error: error.message || "Sign-in failed. Check your email and password.",
          };
        }
      },

      logout: () => {
        if (!isDemoMode) api.post("/auth/logout").catch(() => {});
        Cookies.remove(GOV_COOKIE);
        localStorage.removeItem("pacul-gov-auth");
        set({ user: null, isAuthenticated: false });
      },

      setUser: (user) => {
        const u = sanitizeGovUser(user);
        set({
          user: {
            ...u,
            governmentUnit: u.governmentUnit ?? u.government_unit,
            avatarInitials: u.avatarInitials ?? u.name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase(),
          },
          isAuthenticated: true,
        });
      },
    }),
    {
      name: "pacul-gov-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      merge: (persistedState, currentState) => {
        const ps = persistedState as { user?: GovUser; isAuthenticated?: boolean } | undefined;
        if (!ps?.user) return { ...currentState, ...ps };
        return {
          ...currentState,
          ...ps,
          user: sanitizeGovUser(ps.user),
        };
      },
    }
  )
);
