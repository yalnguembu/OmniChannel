import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import { NotificationsPage } from "@/pages/_portal/settings/NotificationsPage";

export const Route = createFileRoute("/_portal/settings/notifications")({
  component: NotificationsPage,
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.NOTIFICATION_READ,
      redirectTo: "/forbidden",
    });
  },
});
