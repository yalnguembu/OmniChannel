import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import { ApiKeysPage } from "@/pages/_portal/integrations/api-keys";

export const Route = createFileRoute("/_portal/integrations/api-keys")({
  component: ApiKeysPage,
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.COMPANYAPIKEY_READ,
      redirectTo: "/forbidden",
    });
  },
});
