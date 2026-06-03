import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import { SettingsChannelsPage } from "@/pages/_portal/settings/SettingsChannelsPage";

export const Route = createFileRoute("/_portal/settings/channels")({
  component: SettingsChannelsPage,
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.COMPANYCHANNEL_WRITE,
      redirectTo: "/forbidden",
    });
  },
});
