import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import { CampaignsPage } from "@/pages/_portal/campaigns/CampaignsPage";

export const Route = createFileRoute("/_portal/campaigns/")({
  component: CampaignsPage,
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.CAMPAIGN_READ,
      redirectTo: "/forbidden",
    });
  },
});
