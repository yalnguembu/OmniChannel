import { SyncLogsPage } from "@/pages/_portal/integrations/sync-logs";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_portal/integrations/sync-logs")({
  component: SyncLogsPage,
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.INTEGRATIONSYNCLOG_READ,
      redirectTo: "/forbidden",
    });
  },
});
