import { createFileRoute, redirect } from "@tanstack/react-router";
import { LoginPage } from "@/pages/auth/LoginPage";
import { useAuthStore } from "@/store/authStore";
import { dashboardPathFor, sanitizeReturnUrl } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  validateSearch: (search: Record<string, unknown>): { returnUrl?: string } => ({
    returnUrl:
      typeof search.returnUrl === "string" ? search.returnUrl : undefined,
  }),
  beforeLoad: ({ search }) => {
    const { isAuthenticated, user } = useAuthStore.getState();
    if (!isAuthenticated) return;
    // Already signed in — honour a pending returnUrl, else the user's dashboard.
    const target = sanitizeReturnUrl(search.returnUrl);
    if (target) throw redirect({ href: target });
    throw redirect({ to: dashboardPathFor(user?.userType) });
  },
});
