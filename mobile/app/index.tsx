import { Redirect } from "expo-router";
import { FullScreenLoader } from "@/components/shared/Loader";
import { useAuthStore } from "@/store/authStore";

/**
 * Point d'entrée : on attend la relecture du token persisté avant d'orienter,
 * sinon un utilisateur déjà connecté serait renvoyé au login à chaque lancement.
 */
export default function Index() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.token);

  if (!hydrated) return <FullScreenLoader />;
  return <Redirect href={token ? "/inbox" : "/login"} />;
}
