import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface AuthUser {
  id?: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  userType?: string | null;
  companyId?: string | null;
  companyName?: string | null;
  permissions?: string[];
}

interface SessionPayload {
  accessToken: string;
  refreshToken?: string | null;
  user?: AuthUser | null;
  requiresPasswordChange?: boolean;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  requiresPasswordChange: boolean;
  /** Faux jusqu'à ce que le token persisté soit relu (AsyncStorage est async). */
  hydrated: boolean;
  setSession: (payload: SessionPayload) => void;
  /** Rotation des seuls jetons — utilisé par l'intercepteur de rafraîchissement. */
  setTokens: (accessToken: string, refreshToken?: string | null) => void;
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
      requiresPasswordChange: false,
      hydrated: false,
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
          // Le backend peut faire tourner le jeton de rafraîchissement ou le
          // laisser tel quel : on ne l'écrase que s'il en renvoie un.
          refreshToken: refreshToken ?? s.refreshToken,
          isAuthenticated: true,
        })),

      setUser: (user) => set({ user }),
      logout: () =>
        set({
          token: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
          requiresPasswordChange: false,
        }),
    }),
    {
      // Même clé que le web (`oc-auth`) : les deux clients ne partagent pas de
      // stockage, mais garder le nom évite d'avoir deux conventions en tête.
      name: "oc-auth",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        token: s.token,
        refreshToken: s.refreshToken,
        user: s.user,
        isAuthenticated: s.isAuthenticated,
        requiresPasswordChange: s.requiresPasswordChange,
      }),
      // La navigation attend `hydrated` : sans ça le premier rendu croit qu'on
      // est déconnecté et renvoie au login à chaque démarrage.
      onRehydrateStorage: () => (state, error) => {
        if (error) console.warn("auth rehydrate error", error);
        useAuthStore.setState({ hydrated: true });
      },
    },
  ),
);
