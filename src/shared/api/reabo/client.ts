import { client as reaboClient } from "@/shared/api/reabo/generated/client.gen";
import { useReaboAuthStore } from "@/store/useReaboAuthStore";
import { isTokenExpired, parseReaboSession } from "@/models/reabo.models";

/**
 * Axios setup for the ReaboCanal API — a second, independent client.
 *
 * It must stay separate from the OmniChannel client configured in
 * `shared/api/setup.ts`: different host, different token, different response
 * envelope (see `unwrap.ts`), and a 401 here means "the fujisat session
 * lapsed", never "log the agent out of OmniChannel".
 */

/**
 * Production host; override per environment with `VITE_REABO_API_URL`.
 *
 * The **origin only** — the generated SDK's paths already start with
 * `/api/v1`, so a base URL carrying that prefix would send every request to
 * `/api/v1/api/v1/…`. `admin-web` sets its own `VITE_API_URL` the same way.
 */
const DEFAULT_BASE_URL = "https://fujisat.cm:4430";

export const REABO_BASE_URL =
  (import.meta.env.VITE_REABO_API_URL as string) || DEFAULT_BASE_URL;

reaboClient.instance.defaults.baseURL = REABO_BASE_URL;
reaboClient.instance.defaults.timeout = 120_000;
// Matches ReaboCanal's own `setupApi`. Safe to pin here, unlike on the
// OmniChannel client: nothing is uploaded as multipart through this one.
reaboClient.instance.defaults.headers.common["Content-Type"] = "application/json";

/**
 * Endpoints that must go out **without** an Authorization header — sending a
 * stale token to the login or refresh route is how a refresh loop starts.
 * Mirrors `AUTH_ROUTES` in ReaboCanal's `packages/ressources/src/config.ts`.
 */
const AUTH_ROUTES = [
  "login",
  "refresh-token",
  "register",
  "send-otp-code",
  "validate-otp-code",
  "send-new-password",
  "update-password-after-reset",
  "reset-password",
];

const isAuthRoute = (url?: string): boolean =>
  !!url && AUTH_ROUTES.some((route) => url.toLowerCase().includes(route));

/**
 * Refresh this long before the token actually lapses.
 *
 * A request that leaves with a token expiring in-flight comes back 401 and has
 * to be replayed; renewing a little early costs one call and avoids the whole
 * round trip — and, on a payment, avoids a failure the agent has to explain.
 */
const EXPIRY_SKEW_MS = 45_000;

reaboClient.instance.interceptors.request.use(async (config) => {
  if (isAuthRoute(config.url)) return config;

  const token = await getValidToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

/**
 * The access token, renewed first when it has run out.
 *
 * This is the proactive half of the pair: the response interceptor below still
 * catches a 401 the clock did not predict (a token revoked server-side, a
 * device clock that drifted), but in normal operation the session rolls over
 * without a single failed request.
 */
async function getValidToken(): Promise<string | null> {
  const { token, refreshToken, tokenExpiresUtc } = useReaboAuthStore.getState();
  if (!token) return null;
  if (!isTokenExpired(tokenExpiresUtc, EXPIRY_SKEW_MS)) return token;
  if (!refreshToken) return token;

  refreshInFlight = refreshInFlight ?? refreshSession();
  const renewed = await refreshInFlight.finally(() => {
    refreshInFlight = null;
  });
  // A failed renewal still sends the old token: it may simply be the expiry
  // date that is wrong, and letting the server rule on it beats silently
  // dropping the Authorization header.
  return renewed ?? token;
}

/**
 * Single-flight refresh.
 *
 * ReaboCanal's own `TokenManager` documents why this queue exists: a screen
 * firing six requests at the moment the token expires produces six concurrent
 * refreshes, and depending on the backend's rotation policy that either burns
 * five tokens or invalidates the one that succeeded — logging the agent out
 * through their own page load. The first refresh is authoritative and every
 * other caller awaits its result.
 */
let refreshInFlight: Promise<string | null> | null = null;

/**
 * Renews the access token, transcribing `TokenManager.performTokenRefresh`
 * from ReaboCanal rather than reinterpreting it. Three details matter, and all
 * three are theirs:
 *
 * - the payload is read at `response.data.data` and considered valid only when
 *   it carries **both** `token` and `tokenExpiresUtc`;
 * - there is **no envelope code check** here either — the endpoint follows the
 *   login's convention, not the mypos one;
 * - the **refresh token is not rotated**. The response renews the access token
 *   only, and the original refresh token is carried over untouched. Overwriting
 *   it with an empty value is the exact bug their `restoreAuthEverywhere`
 *   warns about: silent renewal stops working for good.
 */
async function refreshSession(): Promise<string | null> {
  const { token, refreshToken, setSession, account, permissions } =
    useReaboAuthStore.getState();
  if (!token || !refreshToken) return null;

  try {
    const res = await reaboClient.instance.post("/api/v1/User/refresh-token", {
      token,
      refreshToken,
    });
    const session = parseReaboSession(res?.data);
    if (!session?.token || !session.tokenExpiresUtc) return null;

    setSession({
      token: session.token,
      tokenExpiresUtc: session.tokenExpiresUtc,
      refreshToken,
      refreshTokenExpiresUtc:
        session.refreshTokenExpiresUtc ??
        useReaboAuthStore.getState().refreshTokenExpiresUtc,
      // A refresh renews a token, not an identity: keep what the login resolved.
      account,
      permissions: session.permissions?.length ? session.permissions : permissions,
    });
    return session.token;
  } catch {
    return null;
  }
}

reaboClient.instance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status;
    const config = error?.config;

    if (status !== 401 || !config || isAuthRoute(config.url) || config._retried) {
      if (status === 401) useReaboAuthStore.getState().disconnect();
      return Promise.reject(error);
    }

    refreshInFlight = refreshInFlight ?? refreshSession();
    const token = await refreshInFlight.finally(() => {
      refreshInFlight = null;
    });

    if (!token) {
      // No way back: drop the session so the UI shows "reconnect" instead of
      // failing every call silently.
      useReaboAuthStore.getState().disconnect();
      return Promise.reject(error);
    }

    config._retried = true;
    config.headers = config.headers ?? {};
    config.headers["Authorization"] = `Bearer ${token}`;
    return reaboClient.instance.request(config);
  },
);

export { reaboClient };
