import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "@/shared/types/auth";

interface SessionPayload {
  accessToken: string;
  refreshToken?: string | null;
  user?: AuthUser | null;
  /** When true, the user must set a new password before using the app. */
  requiresPasswordChange?: boolean;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** Forces the user through the change-password screen before anything else. */
  requiresPasswordChange: boolean;
  /** Store a full session (tokens + user) — used after login. */
  setSession: (payload: SessionPayload) => void;
  /** Rotate just the tokens — used by the refresh interceptor. */
  setTokens: (accessToken: string, refreshToken?: string | null) => void;
  /** Replace the current user — used by the /me bootstrap. */
  setUser: (user: AuthUser) => void;
  /** Clear the force-change flag once the password has been updated. */
  setRequiresPasswordChange: (value: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      requiresPasswordChange: false,
      setSession: ({
        accessToken,
        refreshToken = null,
        user = null,
        requiresPasswordChange = false,
      }) =>
        set({
          token: accessToken,
          refreshToken,
          user,
          isAuthenticated: true,
          requiresPasswordChange,
        }),
      setTokens: (accessToken, refreshToken = null) =>
        set((s) => ({
          token: accessToken,
          refreshToken: refreshToken ?? s.refreshToken,
        })),
      setUser: (user) => set({ user }),
      setRequiresPasswordChange: (value) =>
        set({ requiresPasswordChange: value }),
      logout: () =>
        set({
          token: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
          requiresPasswordChange: false,
        }),
    }),
    { name: "oc-auth" },
  ),
);
