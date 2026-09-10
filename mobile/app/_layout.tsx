import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { bindAppStateToQueryFocus, queryClient } from "@/lib/queryClient";
import { ToastHost } from "@/lib/toast";
import { colors } from "@/theme";

export default function RootLayout() {
  // Pont état de l'app → « fenêtre focalisée » de React Query.
  useEffect(() => bindAppStateToQueryFocus(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.white },
          }}
        />
        <ToastHost />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
