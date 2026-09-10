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

// Session expirée : on vide le store, les layouts protégés renvoient au login.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      const { token, logout } = useAuthStore.getState();
      if (token) logout();
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
