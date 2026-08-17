import type { User, UserPreferences } from "@/store/auth.store";
import { DEFAULT_PREFERENCES } from "@/store/auth.store";
import type { RegisterDTO, AuthResponse, UpdateProfileDTO, ChangePasswordDTO } from "@/services/auth.service";
import { demoDelay, DEMO_ACCOUNT, DEMO_GOV_ACCOUNT, DEMO_USER_ID } from "./demo-mode";

const USERS_KEY = "pacul-demo-users";

interface StoredUser extends User {
  password: string;
}

const BUILTIN_DEMO: StoredUser = {
  id: DEMO_USER_ID,
  name: "Rendra Pratama",
  email: DEMO_ACCOUNT.email,
  password: DEMO_ACCOUNT.password,
  city: "Surabaya",
  district: "Wonokromo",
  location: "Surabaya",
  kecamatan: "Wonokromo",
  role: "user",
  avatarColor: "#2D5F3F",
  bio: "Warga aktif Surabaya peduli lingkungan.",
  joinedAt: "2025-01-15T00:00:00.000Z",
  preferences: DEFAULT_PREFERENCES,
};

function loadUsers(): StoredUser[] {
  if (typeof window === "undefined") return [BUILTIN_DEMO];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    const stored: StoredUser[] = raw ? JSON.parse(raw) : [];
    const hasBuiltin = stored.some((u) => u.email === BUILTIN_DEMO.email);
    return hasBuiltin ? stored : [BUILTIN_DEMO, ...stored];
  } catch {
    return [BUILTIN_DEMO];
  }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users.filter((u) => u.id !== "demo")));
}

function toPublicUser(u: StoredUser): User {
  const { password: _pw, ...user } = u;
  return user;
}

function makeToken(id: string | number) {
  return `demo_token_${id}`;
}

function findByEmail(email: string): StoredUser | undefined {
  return loadUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

function findById(id: string | number): StoredUser | undefined {
  return loadUsers().find((u) => String(u.id) === String(id));
}

function parseUserIdFromToken(token: string): string | null {
  const m = token.match(/^demo_token_(.+)$/);
  return m?.[1] ?? null;
}

export const demoAuth = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    await demoDelay();
    const user = findByEmail(email);
    if (!user || user.password !== password) {
      throw { message: "Incorrect email or password", errors: {} };
    }
    return {
      token: makeToken(user.id),
      user: toPublicUser(user),
      message: "Signed in (demo mode)",
    };
  },

  register: async (data: RegisterDTO): Promise<AuthResponse> => {
    await demoDelay(500);
    if (findByEmail(data.email)) {
      throw {
        message: "This email is already registered",
        errors: { email: ["Email already in use"] },
      };
    }
    const newUser: StoredUser = {
      id: `user_${Date.now()}`,
      name: data.name,
      email: data.email,
      password: data.password,
      city: data.city ?? data.location ?? "Surabaya",
      district: data.district ?? data.kecamatan,
      location: data.location ?? data.city ?? "Surabaya",
      kecamatan: data.kecamatan ?? data.district,
      bio: data.bio,
      role: "user",
      avatarColor: "#2D5F3F",
      joinedAt: new Date().toISOString(),
      preferences: DEFAULT_PREFERENCES,
    };
    const users = loadUsers().filter((u) => u.id !== "demo");
    users.push(newUser);
    saveUsers(users);
    return {
      token: makeToken(newUser.id),
      user: toPublicUser(newUser),
      message: "Account created. Welcome to PACUL.",
    };
  },

  getMe: async (token: string): Promise<User> => {
    await demoDelay(150);
    const id = parseUserIdFromToken(token);
    if (!id) throw { message: "Invalid session", errors: {} };
    const user = findById(id);
    if (!user) throw { message: "User not found", errors: {} };
    return toPublicUser(user);
  },

  logout: async (): Promise<void> => {
    await demoDelay(100);
  },

  updateProfile: async (token: string, data: UpdateProfileDTO): Promise<User> => {
    await demoDelay(300);
    const id = parseUserIdFromToken(token);
    if (!id) throw { message: "Invalid session", errors: {} };
    const users = loadUsers();
    const idx = users.findIndex((u) => String(u.id) === id);
    if (idx === -1) throw { message: "User not found", errors: {} };
    const updated: StoredUser = {
      ...users[idx],
      name: data.name ?? users[idx].name,
      city: data.city ?? data.location ?? users[idx].city,
      district: data.district ?? data.kecamatan ?? users[idx].district,
      location: data.location ?? data.city ?? users[idx].location,
      kecamatan: data.kecamatan ?? data.district ?? users[idx].kecamatan,
      bio: data.bio ?? users[idx].bio,
      avatarColor: data.avatarColor ?? users[idx].avatarColor,
      avatarUrl: data.avatarUrl ?? users[idx].avatarUrl,
      preferences: data.preferences ?? users[idx].preferences,
    };
    if (updated.id === "demo") {
      Object.assign(BUILTIN_DEMO, updated);
    } else {
      users[idx] = updated;
      saveUsers(users.filter((u) => u.id !== "demo"));
    }
    return toPublicUser(updated);
  },

  uploadAvatar: async (token: string, file: File): Promise<{ avatar_url: string }> => {
    await demoDelay(400);
    return { avatar_url: URL.createObjectURL(file) };
  },

  changePassword: async (token: string, data: ChangePasswordDTO): Promise<void> => {
    await demoDelay(300);
    const id = parseUserIdFromToken(token);
    if (!id) throw { message: "Invalid session", errors: {} };
    const current = data.current_password;
    const next = data.new_password ?? data.password;
    const confirm = data.new_password_confirmation ?? data.password_confirmation;
    if (!next || next !== confirm) {
      throw { message: "Password confirmation does not match", errors: {} };
    }
    const users = loadUsers();
    const idx = users.findIndex((u) => String(u.id) === id);
    if (idx === -1) throw { message: "User not found", errors: {} };
    if (users[idx].id === DEMO_USER_ID) {
      throw { message: "The demo account password cannot be changed", errors: {} };
    }
    if (users[idx].password !== current) {
      throw { message: "Current password is incorrect", errors: {} };
    }
    users[idx].password = next;
    if (users[idx].id !== "demo") {
      saveUsers(users.filter((u) => u.id !== "demo"));
    } else {
      BUILTIN_DEMO.password = next;
    }
  },

  deleteAccount: async (token: string): Promise<void> => {
    await demoDelay(300);
    const id = parseUserIdFromToken(token);
    if (!id || id === "demo") {
      throw { message: "The demo account cannot be deleted", errors: {} };
    }
    const users = loadUsers().filter((u) => String(u.id) !== id && u.id !== "demo");
    saveUsers(users);
  },

  /**
   * Demo government sign-in. Only the documented demo government account is
   * accepted; it represents a fictional responder, not a real agency.
   */
  govLogin: async (email: string, password: string) => {
    await demoDelay(400);
    if (email.trim().toLowerCase() !== DEMO_GOV_ACCOUNT.email || password !== DEMO_GOV_ACCOUNT.password) {
      throw { message: "Invalid government demo credentials", errors: {} };
    }
    return {
      token: "demo_gov_token_officer",
      user: {
        id: "gov_demo",
        name: "Ir. Hendro Gunawan, M.Si",
        email: DEMO_GOV_ACCOUNT.email,
        role: "government" as const,
        government_unit: "Dinas Lingkungan Hidup Kota Surabaya",
        governmentUnit: "Dinas Lingkungan Hidup Kota Surabaya",
        avatarInitials: "HG",
      },
    };
  },
};

export function getDemoToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("pacul_token");
}

export function isDemoToken(token: string | null | undefined): boolean {
  return !!token && (token.startsWith("demo_token_") || token.startsWith("demo_gov_token_") || token === "guest_token_demo");
}
