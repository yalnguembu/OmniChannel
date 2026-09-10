import { Redirect, Stack } from "expo-router";
import { FullScreenLoader } from "@/components/shared/Loader";
import { useSignalR } from "@/hooks/useSignalR";
import { useAuthStore } from "@/store/authStore";
import { colors } from "@/theme";

/**
 * Zone authentifiée. Le hub temps réel est monté ici (et non dans un écran) afin
 * que la connexion survive à la navigation liste ↔ discussion : c'est aussi elle
 * qui persiste l'état « lu » via `JoinConversation`.
 */
export default function AppLayout() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.token);

  // Hook inconditionnel (il ne se connecte pas tant qu'il n'y a pas de token).
  useSignalR();

  if (!hydrated) return <FullScreenLoader />;
  if (!token) return <Redirect href="/login" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.white },
      }}
    />
  );
}
