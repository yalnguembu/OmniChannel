import { createFileRoute, redirect } from "@tanstack/react-router";
import { ChangePasswordPage } from "@/pages/auth/ChangePasswordPage";
import { useAuthStore } from "@/store/authStore";

export const Route = createFileRoute("/change-password")({
  component: ChangePasswordPage,
  beforeLoad: () => {
    // Must be signed in to set a new password.
    if (!useAuthStore.getState().isAuthenticated) {
      throw redirect({ to: "/login" });
    }
  },
});
