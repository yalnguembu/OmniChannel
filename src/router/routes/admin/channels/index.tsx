import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import ChannelsPage from "@/pages/admin/channels/ChannelsPage";

export const Route = createFileRoute("/admin/channels/")({
  component: ChannelsPage,
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.CHANNEL_READ,
      redirectTo: "/forbidden",
    });
  },
});
