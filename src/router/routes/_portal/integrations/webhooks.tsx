import { WebhooksPage } from "@/pages/_portal/integrations/webhooks";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_portal/integrations/webhooks")({
  component: WebhooksPage,
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.WEBHOOKENDPOINT_READ,
      redirectTo: "/forbidden",
    });
  },
});
