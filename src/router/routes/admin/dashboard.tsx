import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import DashboardPage from "@/pages/admin/DashboardPage";

export const Route = createFileRoute("/admin/dashboard")({
  component: DashboardPage,
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.DASHBOARD_READ,
      redirectTo: "/forbidden",
    });
  },
});
