import { useCallback, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Side-effect import: configures the ReaboCanal axios instance (base URL,
// token injection, refresh queue) before any generated call goes out.
import "@/shared/api/reabo/client";
import {
  postApiV1UserLogin,
  getApiV1UserProfil,
  getApiV1UserGetSolde,
  getApiV1UserProfilGetUserPermissions,
} from "@/shared/api/reabo/generated/sdk.gen";
import { callReabo } from "@/shared/api/reabo/unwrap";
import { useReaboAuthStore } from "@/store/useReaboAuthStore";
import {
  parseReaboSession,
  parseReaboSolde,
  toReaboAccount,
  type ReaboSolde,
} from "@/models/reabo.models";

export const reaboKeys = {
  all: ["reabo"] as const,
  solde: () => [...reaboKeys.all, "solde"] as const,
  profil: () => [...reaboKeys.all, "profil"] as const,
};

/** What the status pill renders, in one value. */
export type ReaboStatus = "disconnected" | "expired" | "connected";

/**
 * ReaboCanal connection: sign in, verify, disconnect.
 *
 * "Test the connection" is not a ping: it signs in, then reads the profile and
 * the balance. Nothing is stored until all three answer — a token that cannot
 * read its own account is not a usable session, and finding that out at the
 * first réabonnement would be far worse.
 */
export function useReaboAuth() {
  const qc = useQueryClient();
  const token = useReaboAuthStore((s) => s.token);
  const account = useReaboAuthStore((s) => s.account);
  const permissions = useReaboAuthStore((s) => s.permissions);
  const tokenExpiresUtc = useReaboAuthStore((s) => s.tokenExpiresUtc);
  const setSession = useReaboAuthStore((s) => s.setSession);
  const storeDisconnect = useReaboAuthStore((s) => s.disconnect);

  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const status = useMemo<ReaboStatus>(() => {
    if (!token) return "disconnected";
    return useReaboAuthStore.getState().isExpired() ? "expired" : "connected";
  }, [token, tokenExpiresUtc]);

  const connect = useCallback(
    async (login: string, password: string): Promise<boolean> => {
      setIsConnecting(true);
      setError(null);
      try {
        const auth = await callReabo<unknown>(
          postApiV1UserLogin({ body: { login, password } }),
        );
        if (!auth.success) {
          setError(auth.message);
          return false;
        }

        const session = parseReaboSession(auth.data);
        if (!session?.token) {
          setError("Réponse de connexion inattendue : aucun jeton reçu.");
          return false;
        }

        // Store the token first: the verification calls below need it on the
        // wire, and a failure past this point clears everything anyway.
        setSession({
          token: session.token,
          tokenExpiresUtc: session.tokenExpiresUtc ?? null,
          refreshToken: session.refreshToken ?? null,
          refreshTokenExpiresUtc: session.refreshTokenExpiresUtc ?? null,
          account: toReaboAccount(session),
          permissions: session.permissions ?? [],
        });

        const [profil, solde, perms] = await Promise.all([
          callReabo<Record<string, unknown>>(getApiV1UserProfil({})),
          callReabo<unknown>(getApiV1UserGetSolde({})),
          callReabo<string[]>(getApiV1UserProfilGetUserPermissions({})),
        ]);

        if (!profil.success) {
          storeDisconnect();
          setError(`Connexion refusée à la lecture du profil : ${profil.message}`);
          return false;
        }
        if (!solde.success) {
          storeDisconnect();
          setError(`Connexion refusée à la lecture du solde : ${solde.message}`);
          return false;
        }

        // Permissions are a bonus: the login payload already carries them, and
        // the endpoint failing must not sink an otherwise valid session.
        if (perms.success && Array.isArray(perms.data) && perms.data.length) {
          setSession({
            token: session.token,
            tokenExpiresUtc: session.tokenExpiresUtc ?? null,
            refreshToken: session.refreshToken ?? null,
            refreshTokenExpiresUtc: session.refreshTokenExpiresUtc ?? null,
            account: toReaboAccount(session),
            permissions: perms.data,
          });
        }

        qc.setQueryData(reaboKeys.solde(), parseReaboSolde(solde.data));
        toast.success("Connexion Reabo établie");
        return true;
      } finally {
        setIsConnecting(false);
      }
    },
    [qc, setSession, storeDisconnect],
  );

  const disconnect = useCallback(() => {
    storeDisconnect();
    qc.removeQueries({ queryKey: reaboKeys.all });
    setError(null);
  }, [qc, storeDisconnect]);

  return {
    status,
    account,
    permissions,
    isConnecting,
    error,
    connect,
    disconnect,
  };
}

/**
 * Agent balance — the figure shown next to the connection status, and the one
 * that decides whether "pay from balance" is even offered.
 */
export function useReaboSolde() {
  const token = useReaboAuthStore((s) => s.token);

  return useQuery({
    queryKey: reaboKeys.solde(),
    enabled: !!token,
    staleTime: 60_000,
    queryFn: async (): Promise<ReaboSolde | null> => {
      const res = await callReabo<unknown>(getApiV1UserGetSolde({}));
      if (!res.success) throw new Error(res.message);
      return parseReaboSolde(res.data);
    },
  });
}
