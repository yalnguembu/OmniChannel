import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import IntegrationsPage from "@/pages/_portal/integrations/IntegrationsPage";

export const Route = createFileRoute("/_portal/integrations/")({
  component: IntegrationsPage,
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.INTEGRATION_READ,
      redirectTo: "/forbidden",
    });
  },
});
