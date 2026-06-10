import { createFileRoute, redirect } from "@tanstack/react-router";
import { LoginPage } from "@/pages/auth/LoginPage";
import { useAuthStore } from "@/store/authStore";
import { dashboardPathFor } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  beforeLoad: () => {
    const { isAuthenticated, user, requiresPasswordChange } =
      useAuthStore.getState();
    if (!isAuthenticated) return;
    // if (requiresPasswordChange) throw redirect({ to: "/change-password" });
    throw redirect({ to: dashboardPathFor(user?.userType) });
  },
});
