import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import ProvidersPage from "@/pages/admin/providers/ProvidersPage";

export const Route = createFileRoute("/admin/providers/")({
  component: ProvidersPage,
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.PROVIDER_READ,
      redirectTo: "/forbidden",
    });
  },
});
