import { create } from "zustand";
import { apiClient } from "@/src/lib/api-client";
import {
  getAuthJwtCookie,
  removeAuthJwtCookie,
  setAuthJwtCookie,
} from "@/src/lib/auth-token-cookie";
import type { JWTPayload, LoginResponse, User } from "@/src/types/auth";

function normalizeSafeUser(raw: Record<string, unknown>): User {
  return {
    id: String(raw._id ?? raw.id ?? ""),
    email: String(raw.email ?? ""),
    fullName: String(raw.fullName ?? ""),
    role: raw.role as User["role"],
  };
}

function userFromJwt(p: JWTPayload): User {
  return {
    id: p.sub,
    email: p.email,
    fullName: "",
    role: p.role,
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  /** False until `checkAuth` (or `login`) has resolved — avoids flash on refresh. */
  isHydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  /** Clears js-cookie token and in-memory auth state. */
  logout: () => void;
  /** Clears in-memory state only (e.g. after 401 when cookie already removed). */
  clearAuthState: () => void;
  /** Hydrate from JWT cookie + `GET /auth/profile`. */
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isHydrated: false,

  clearAuthState: () => set({ user: null, isAuthenticated: false }),

  login: async (email, password) => {
    const { data } = await apiClient.post<LoginResponse>("/auth/login", { email, password });
    if (!data?.accessToken || data.user == null) {
      throw new Error("Invalid login response");
    }
    const rawUser = data.user as unknown as Record<string, unknown>;
    const user = normalizeSafeUser(rawUser);
    if (user.role !== "admin") {
      throw new Error("Admin role required");
    }
    setAuthJwtCookie(data.accessToken);
    set({
      user,
      isAuthenticated: true,
      isHydrated: true,
    });
  },

  logout: () => {
    removeAuthJwtCookie();
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = getAuthJwtCookie();
    if (!token) {
      set({ user: null, isAuthenticated: false, isHydrated: true });
      return;
    }
    try {
      const { data } = await apiClient.get<JWTPayload>("/auth/profile");
      if (data.role !== "admin") {
        removeAuthJwtCookie();
        set({ user: null, isAuthenticated: false, isHydrated: true });
        return;
      }
      set({
        user: userFromJwt(data),
        isAuthenticated: true,
        isHydrated: true,
      });
    } catch {
      removeAuthJwtCookie();
      set({ user: null, isAuthenticated: false, isHydrated: true });
    }
  },
}));
