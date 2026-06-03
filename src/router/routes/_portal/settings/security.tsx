import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import { DevicesPage } from "@/pages/_portal/settings/DevicesPage";

export const Route = createFileRoute("/_portal/settings/security")({
  component: DevicesPage,
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.SETTING_READ,
      redirectTo: "/forbidden",
    });
  },
});
