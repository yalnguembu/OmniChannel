import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "@/shared/types/auth";

interface SessionPayload {
  accessToken: string;
  refreshToken?: string | null;
  user?: AuthUser | null;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** Store a full session (tokens + user) — used after login. */
  setSession: (payload: SessionPayload) => void;
  /** Rotate just the tokens — used by the refresh interceptor. */
  setTokens: (accessToken: string, refreshToken?: string | null) => void;
  /** Replace the current user — used by the /me bootstrap. */
  setUser: (user: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      setSession: ({ accessToken, refreshToken = null, user = null }) =>
        set({ token: accessToken, refreshToken, user, isAuthenticated: true }),
      setTokens: (accessToken, refreshToken = null) =>
        set((s) => ({
          token: accessToken,
          refreshToken: refreshToken ?? s.refreshToken,
        })),
      setUser: (user) => set({ user }),
      logout: () =>
        set({
          token: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        }),
    }),
    { name: "oc-auth" },
  ),
);
