import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import { BlocklistPage } from "@/pages/_portal/settings/BlocklistPage";

export const Route = createFileRoute("/_portal/settings/blocklist")({
  component: BlocklistPage,
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.BLOCKLIST_WRITE,
      redirectTo: "/forbidden",
    });
  },
});
