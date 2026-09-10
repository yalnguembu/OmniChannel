/**
 * WhatsApp media/host base URL.
 *
 * The WhatsApp inbox goes through the generated SDK (see useWhatsapp.ts),
 * which targets `VITE_API_URL`. This module resolves the relative media paths
 * the API returns (`internalStorageUrl`, and the bare URLs some messages
 * carry in `content`).
 */
const apiUrl = (import.meta.env.VITE_API_URL as string) || "";

/** API origin, without the trailing `/api`. Empty in dev — see below. */
export const BASE_URL = apiUrl.replace(/\/api\/?$/, "");

/**
 * Prefix that relative media paths are resolved against.
 *
 * In dev `VITE_API_URL` is deliberately empty so the app stays same-origin
 * and the auth cookie flows through the Vite proxy. But media is **not**
 * served under `/api` (see `/download_media` in spec.yaml), and the proxy
 * only forwards `/api` and `/hubs` — so a bare relative path went to the Vite
 * dev server, which answered with `index.html`. The browser then reported
 * every picture, video and voice note as a broken file.
 *
 * `/__media` is a dev-only alias: Vite strips it and forwards the rest to the
 * API host, whatever path the backend happens to use. In production
 * `BASE_URL` is the API origin and the URL is absolute, as before.
 */
export const MEDIA_PREFIX = BASE_URL || "/__media";

/** Absolute URL for a media path returned by the API. */
export function mediaUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (/^(https?:|data:|blob:)/.test(url)) return url;
  return `${MEDIA_PREFIX}${url.startsWith("/") ? "" : "/"}${url}`;
}
