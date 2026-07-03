import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";

export const Route = createFileRoute("/_portal/$productId/contacts")({
  component: () => <Outlet />,
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.CLIENT_READ,
      redirectTo: "/forbidden",
    });
  },
});
