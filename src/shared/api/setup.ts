import { client } from "@/shared/api/generated/client.gen";
import { useAuthStore } from "@/store/authStore";
import type {
  ApiRequest,
  ApiResponse,
  FailedResponse,
} from "@/shared/types/api";

// Empty VITE_API_URL (dev) → relative baseURL: requests hit the Vite origin and
// go through its proxy (same-origin, no CORS). In prod, set VITE_API_URL to the
// absolute API origin. Generated SDK paths already include `/api`, so this is
// the origin only — no trailing `/api`.
client.instance.defaults.baseURL =
  (import.meta.env.VITE_API_URL as string) || "";
// Cookie-based auth: send/receive credentials so the browser stores the login
// cookie and returns it. A direct cross-origin call needs the server to send a
// specific Access-Control-Allow-Origin (not `*`) + Access-Control-Allow-
// Credentials: true; the dev proxy sidesteps that by staying same-origin.
client.instance.defaults.withCredentials = true;

client.instance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Any 401 → clear the session and bounce to the login page.
client.instance.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      useAuthStore.getState().logout();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

// execute request catch error smoothly
export async function handleRequest<T>(
  requestPromise: ApiRequest<T>,
): Promise<ApiResponse<T>> {
  try {
    const response = await requestPromise;

    if (response instanceof Error || response.error) {
      const errorData = response.error || (response as any).response?.data;
      return {
        success: false,
        status: response.status ?? (response as any).response?.status ?? 500,
        title: errorData?.title ?? "Error",
        detail: errorData?.detail ?? "An unexpected error occurred",
        errorCode: errorData?.errorCode ?? "UNKNOWN_ERROR",
        validationErrors: errorData?.validationErrors,
        traceId: errorData?.traceId ?? "",
        ...errorData,
      } as FailedResponse;
    }

    return {
      success: true,
      data: response.data.data as unknown as T,
    };
  } catch (error: any) {
    const errorData = error.response?.data;
    return {
      success: false,
      status: error.status ?? error.response?.status ?? 500,
      title: errorData?.title ?? "Connection Error",
      detail:
        errorData?.detail ?? error.message ?? "Could not connect to the server",
      errorCode: errorData?.errorCode ?? "NETWORK_ERROR",
      validationErrors: errorData?.validationErrors,
      traceId: errorData?.traceId ?? "",
    } as FailedResponse;
  }
}
