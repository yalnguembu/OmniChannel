import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import { IntegrationConnectorsPage } from "@/pages/_portal/integrations/connectors";

export const Route = createFileRoute("/_portal/integrations/connectors/")({
  component: IntegrationConnectorsPage,
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.CONNECTOR_READ,
      redirectTo: "/forbidden",
    });
  },
});
