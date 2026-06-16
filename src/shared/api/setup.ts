import { client } from "@/shared/api/generated/client.gen";
import { useAuthStore } from "@/store/authStore";
import type {
  ApiRequest,
  ApiResponse,
  FailedResponse,
} from "@/shared/types/api";

client.instance.defaults.baseURL =(import.meta.env.VITE_API_URL as string) || "";
client.instance.defaults.withCredentials = true;
client.instance.defaults.headers["Content-Security-Policy"] = "unsafe";
client.instance.defaults.headers["X-Content-Type-Options"] = "nosniff";
client.instance.defaults.headers["X-Frame-Options"] = "DENY";
client.instance.defaults.headers["X-XSS-Protection"] = "1; mode=block";
client.instance.defaults.headers["Referrer-Policy"] =  "strict-origin-when-cross-origin";
client.instance.defaults.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=(), payment=()";
client.instance.defaults.timeout = 1_200_000; // 20 minutes timeout for long-polling requests

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
