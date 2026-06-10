/**
 * WhatsApp media/host base URL.
 *
 * The WhatsApp inbox now goes through the generated SDK (see useWhatsapp.ts),
 * which targets `VITE_API_URL`. This module only exposes the API origin used to
 * resolve media URLs (e.g. `${BASE_URL}${media.internalStorageUrl}`) — derived
 * from the same origin instead of a hardcoded host.
 */
const apiUrl = (import.meta.env.VITE_API_URL as string) || "";
export const BASE_URL = apiUrl.replace(/\/api\/?$/, "");
