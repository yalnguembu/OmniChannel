import { useCallback, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Side-effect import: configures the ReaboCanal axios instance (base URL,
// token injection, refresh queue) before any generated call goes out.
import "@/shared/api/reabo/client";
import {
  postApiV1UserLogin,
  getApiV1UserGetSolde,
} from "@/shared/api/reabo/generated/sdk.gen";
import { callReabo } from "@/shared/api/reabo/unwrap";
import { useReaboAuthStore } from "@/store/useReaboAuthStore";
import {
  parseReaboSession,
  parseReaboSolde,
  reaboLoginError,
  sessionBalances,
  toReaboAccount,
  type ReaboSolde,
} from "@/models/reabo.models";

export const reaboKeys = {
  all: ["reabo"] as const,
  solde: () => [...reaboKeys.all, "solde"] as const,
};

/** What the status pill renders, in one value. */
export type ReaboStatus = "disconnected" | "expired" | "connected";

/**
 * ReaboCanal connection: sign in, disconnect.
 *
 * Deliberately a transcription of `admin-web`'s own login page rather than a
 * reinterpretation of it, because the endpoint does not follow the convention
 * the rest of the API uses:
 *
 * - **no envelope check.** `/User/login` is not read through the `code === 0`
 *   rule that governs the mypos calls. A session exists as soon as the payload
 *   carries a `token`, full stop. Applying the generic rule here is what made
 *   valid logins look like failures.
 * - **failures are negative codes**, not HTTP errors — `-2` is a disabled
 *   account, `-3` a blocked one, and each deserves its own sentence.
 * - **the payload is the whole session.** Permissions and balances travel with
 *   it, so nothing else needs to be called before the agent is connected.
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
        const res = await postApiV1UserLogin({ body: { login, password } });
        // The SDK hands back the HTTP body in `data`; the session sits either
        // at its top level or one level down, depending on the deployment.
        const body = (res as { data?: unknown })?.data;
        const session = parseReaboSession(body);

        if (!session?.token) {
          const envelope = body as { code?: unknown; message?: unknown };
          setError(reaboLoginError(envelope?.code, envelope?.message));
          return false;
        }

        setSession({
          token: session.token,
          tokenExpiresUtc: session.tokenExpiresUtc ?? null,
          refreshToken: session.refreshToken ?? null,
          refreshTokenExpiresUtc: session.refreshTokenExpiresUtc ?? null,
          account: toReaboAccount(session),
          permissions: session.permissions ?? [],
        });

        // Balances come with the login payload — seeding the cache with them
        // means the connection panel shows a figure immediately, and
        // `/User/get-solde` becomes a refresh rather than a gate.
        const balances = sessionBalances(session);
        if (balances.operations !== null || balances.commissions !== null) {
          qc.setQueryData(reaboKeys.solde(), {
            soldeOperations: balances.operations,
            soldeCommissions: balances.commissions,
          } satisfies ReaboSolde);
        }

        toast.success("Connexion Reabo établie");
        return true;
      } catch (e) {
        // A thrown call is a network or server failure; the API signals a
        // refused login in the body, not by throwing.
        setError(
          (e as Error)?.message ?? "Impossible de joindre le serveur Reabo.",
        );
        return false;
      } finally {
        setIsConnecting(false);
      }
    },
    [qc, setSession],
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
 *
 * Seeded by the login payload, refreshed from the server afterwards. A failure
 * here never invalidates the session: it leaves the seeded figures in place.
 */
export function useReaboSolde() {
  const token = useReaboAuthStore((s) => s.token);

  return useQuery({
    queryKey: reaboKeys.solde(),
    enabled: !!token,
    staleTime: 60_000,
    retry: false,
    queryFn: async (): Promise<ReaboSolde | null> => {
      const res = await callReabo<unknown>(getApiV1UserGetSolde({}));
      if (!res.success) throw new Error(res.message);
      return parseReaboSolde(res.data);
    },
  });
}
