import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import SettingsPage from "@/pages/admin/settings/SettingsPage";

export const Route = createFileRoute("/admin/settings/")({
  component: SettingsPage,
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.SETTING_READ,
      redirectTo: "/forbidden",
    });
  },
});
