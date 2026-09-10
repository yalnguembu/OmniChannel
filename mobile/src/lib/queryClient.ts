import { QueryClient, focusManager } from "@tanstack/react-query";
import { AppState, type AppStateStatus } from "react-native";

/** Mêmes réglages que `src/shared/api/queryClient.ts` du web. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * React Query raisonne en « fenêtre focalisée » ; en React Native l'équivalent
 * est l'état de l'application. Sans ce pont, les `refetchInterval` continuent de
 * tourner en arrière-plan et vident la batterie.
 */
export function bindAppStateToQueryFocus() {
  const onChange = (status: AppStateStatus) => {
    focusManager.setFocused(status === "active");
  };
  const sub = AppState.addEventListener("change", onChange);
  return () => sub.remove();
}
