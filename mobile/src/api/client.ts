import axios, { type AxiosResponse } from "axios";
import { useAuthStore } from "@/store/authStore";

/**
 * Origine de l'API (sans `/api`) — les chemins des endpoints l'incluent déjà,
 * exactement comme le SDK généré du web.
 */
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? "").replace(/\/+$/, "");

/** Origine servant à résoudre les URLs média relatives (`internalStorageUrl`). */
export const MEDIA_BASE_URL = API_URL.replace(/\/api\/?$/, "");

/** Hôte du hub SignalR — même origine que l'API sauf surcharge explicite. */
export const SIGNALR_URL =
  (process.env.EXPO_PUBLIC_SIGNALR_URL ?? "").replace(/\/+$/, "") || MEDIA_BASE_URL;

export const api = axios.create({
  baseURL: API_URL,
  // Les envois de média peuvent être longs sur un réseau mobile.
  timeout: 120_000,
});

// Auth par Bearer : contrairement au web (cookie same-origin + withCredentials),
// une app mobile n'a pas de cookie de session fiable — on rejoue le token du login.
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * Rafraîchissement du jeton sur 401.
 *
 * Indispensable sur mobile : l'app reste ouverte des jours et le jeton d'accès
 * expire en quelques heures — sans ça l'agent est déconnecté en pleine
 * conversation. L'API expose `POST /api/auth/refresh`, dont le corps s'appelle
 * d'ailleurs `MobileRefreshRequest`.
 *
 * Un seul rafraîchissement à la fois : les requêtes qui tombent en 401 pendant
 * l'opération attendent la même promesse plutôt que d'en déclencher chacune une
 * (ce qui invaliderait le jeton de rafraîchissement à la première rotation).
 */
let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken } = useAuthStore.getState();
  if (!refreshToken) return null;
  try {
    // Instance nue : passer par `api` relancerait l'intercepteur sur un 401.
    const res = await axios.post(
      `${API_URL}/api/auth/refresh`,
      { refreshToken },
      { timeout: 30_000 },
    );
    const data = res?.data?.data ?? {};
    if (!data.accessToken) return null;
    useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);
    return data.accessToken as string;
  } catch {
    return null;
  }
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status;
    const config = error?.config;
    const url: string = config?.url ?? "";

    // Ni le login ni le rafraîchissement lui-même ne doivent être rejoués.
    const isAuthCall = url.includes("/api/auth/login") || url.includes("/api/auth/refresh");

    if (status === 401 && config && !config.__retried && !isAuthCall) {
      const { token } = useAuthStore.getState();
      if (token) {
        refreshing ??= refreshAccessToken().finally(() => {
          refreshing = null;
        });
        const fresh = await refreshing;
        if (fresh) {
          // On rejoue la requête une seule fois, avec le nouveau jeton.
          config.__retried = true;
          config.headers = { ...(config.headers ?? {}), Authorization: `Bearer ${fresh}` };
          return api.request(config);
        }
        // Rafraîchissement impossible : la session est bel et bien finie.
        useAuthStore.getState().logout();
      }
    }

    return Promise.reject(error);
  },
);

/**
 * Toutes les réponses de l'API sont enveloppées : `{ success, data }`, où `data`
 * est soit un tableau, soit `{ items, total }` pour les recherches paginées.
 */
export function unwrapList<T>(res: AxiosResponse<any>): T[] {
  const payload = res?.data?.data;
  return (Array.isArray(payload) ? payload : (payload?.items ?? [])) as T[];
}

export interface PagedResult<T> {
  items: T[];
  hasNextPage: boolean;
  totalCount: number;
}

/**
 * Même enveloppe que `unwrapList`, mais conserve les métadonnées de pagination
 * dont la fenêtre de messages a besoin. Retombe sur une comparaison à la taille
 * demandée quand le backend n'envoie pas `hasNextPage`.
 */
export function unwrapPaged<T>(res: AxiosResponse<any>, pageSize: number): PagedResult<T> {
  const payload = res?.data?.data;
  if (Array.isArray(payload)) {
    return { items: payload as T[], hasNextPage: false, totalCount: payload.length };
  }
  const items = (payload?.items ?? []) as T[];
  const hasNextPage =
    typeof payload?.hasNextPage === "boolean"
      ? payload.hasNextPage
      : items.length === pageSize;
  return { items, hasNextPage, totalCount: payload?.totalCount ?? items.length };
}

export function unwrapOne<T>(res: AxiosResponse<any>): T | null {
  return (res?.data?.data ?? null) as T | null;
}

/** Message d'erreur lisible pour un toast, quelle que soit la forme renvoyée. */
export function errorMessage(error: unknown, fallback: string): string {
  const e = error as any;
  if (e?.response?.data?.detail) return e.response.data.detail as string;
  if (e?.response?.data?.title) return e.response.data.title as string;
  if (e?.message === "Network Error") return "Serveur injoignable";
  return fallback;
}

/** Résout une URL média relative renvoyée par l'API. */
export function mediaUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (/^(https?:|data:|file:|blob:)/.test(url)) return url;
  return `${MEDIA_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

/**
 * En-têtes à passer aux composants média : `<Image>` / `<VideoView>` ne
 * traversent pas les intercepteurs axios, il faut donc leur fournir le Bearer
 * explicitement si le média est servi derrière l'authentification.
 */
export function mediaHeaders(): Record<string, string> | undefined {
  const token = useAuthStore.getState().token;
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}
