import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import SettingsUsersPage from "@/pages/_portal/settings/SettingsUsersPage";

export const Route = createFileRoute("/_portal/settings/users")({
  component: SettingsUsersPage,
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.USER_WRITE,
      redirectTo: "/forbidden",
    });
  },
});
