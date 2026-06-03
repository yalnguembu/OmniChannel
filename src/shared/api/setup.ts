import { client } from "@/shared/api/generated/client.gen";
import { useAuthStore } from "@/store/authStore";
import type {
  ApiRequest,
  ApiResponse,
  FailedResponse,
} from "@/shared/types/api";
import { AxiosError, AxiosResponse } from "axios";

client.instance.defaults.baseURL =
  (import.meta.env.VITE_API_URL as string) || "/api";

client.instance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Token refresh on 401 ─────────────────────────────────────────────────────
// Single in-flight refresh shared across concurrent 401s.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken } = useAuthStore.getState();
  if (!refreshToken) return null;
  try {
    const res = await client.instance.post("/api/auth/refresh", {
      refreshToken,
    });
    const data = res.data?.data ?? res.data;
    if (data?.accessToken) {
      useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);
      return data.accessToken as string;
    }
    return null;
  } catch {
    return null;
  }
}

client.instance.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as
      | (typeof error.config & { __isRetry?: boolean })
      | undefined;
    const status = error.response?.status;
    const url = original?.url ?? "";
    const isAuthCall =
      url.includes("/auth/refresh") || url.includes("/auth/login");

    if (status === 401 && original && !original.__isRetry && !isAuthCall) {
      original.__isRetry = true;
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }
      const newToken = await refreshPromise;
      if (newToken) {
        original.headers = original.headers ?? {};
        (original.headers as any).Authorization = `Bearer ${newToken}`;
        return client.instance(original);
      }
      // Refresh failed → end the session.
      useAuthStore.getState().logout();
      if (typeof window !== "undefined") window.location.href = "/login";
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
