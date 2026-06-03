import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import { RolesPage } from "@/pages/_portal/settings/RolesPage";

export const Route = createFileRoute("/_portal/settings/roles")({
  component: RolesPage,
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.USERPROFILE_WRITE,
      redirectTo: "/forbidden",
    });
  },
});
