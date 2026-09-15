import { create } from "zustand";
import { persist } from "zustand/middleware";
import { isTokenExpired, type ReaboAccount } from "@/models/reabo.models";

/**
 * ReaboCanal session — separate from `authStore` on purpose.
 *
 * The agent is logged into OmniChannel with one account and into ReaboCanal
 * (fujisat) with another; the two tokens never mix, never share an axios
 * instance, and never expire together. Persisted under its own key so a reload
 * keeps the connection, exactly like the OmniChannel session.
 *
 * The password is never stored — only the tokens the API hands back.
 */
interface ReaboAuthState {
  token: string | null;
  tokenExpiresUtc: string | null;
  refreshToken: string | null;
  refreshTokenExpiresUtc: string | null;
  /** Who is connected, for the status pill. */
  account: ReaboAccount | null;
  /** Permissions as ReaboCanal reports them — drives what the agent may do. */
  permissions: string[];

  isConnected: () => boolean;
  /** True when the access token is past its expiry (or has none). */
  isExpired: () => boolean;

  setSession: (payload: {
    token: string;
    tokenExpiresUtc?: string | null;
    refreshToken?: string | null;
    refreshTokenExpiresUtc?: string | null;
    account?: ReaboAccount | null;
    permissions?: string[];
  }) => void;
  setTokens: (token: string, tokenExpiresUtc?: string | null) => void;
  setAccount: (account: ReaboAccount) => void;
  disconnect: () => void;
}

export const useReaboAuthStore = create<ReaboAuthState>()(
  persist(
    (set, get) => ({
      token: null,
      tokenExpiresUtc: null,
      refreshToken: null,
      refreshTokenExpiresUtc: null,
      account: null,
      permissions: [],

      isConnected: () => !!get().token,
      isExpired: () => isTokenExpired(get().tokenExpiresUtc),

      setSession: ({
        token,
        tokenExpiresUtc = null,
        refreshToken = null,
        refreshTokenExpiresUtc = null,
        account = null,
        permissions = [],
      }) =>
        set({
          token,
          tokenExpiresUtc,
          refreshToken,
          refreshTokenExpiresUtc,
          account,
          permissions,
        }),

      setTokens: (token, tokenExpiresUtc = null) =>
        set({ token, tokenExpiresUtc }),

      setAccount: (account) => set({ account }),

      disconnect: () =>
        set({
          token: null,
          tokenExpiresUtc: null,
          refreshToken: null,
          refreshTokenExpiresUtc: null,
          account: null,
          permissions: [],
        }),
    }),
    {
      name: "oc-reabo",
      partialize: (s) => ({
        token: s.token,
        tokenExpiresUtc: s.tokenExpiresUtc,
        refreshToken: s.refreshToken,
        refreshTokenExpiresUtc: s.refreshTokenExpiresUtc,
        account: s.account,
        permissions: s.permissions,
      }),
    },
  ),
);
