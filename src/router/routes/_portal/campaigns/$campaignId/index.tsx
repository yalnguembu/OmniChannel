import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import { CampaignDetailPage } from "@/pages/_portal/campaigns/CampaignDetailPage";

export const Route = createFileRoute("/_portal/campaigns/$campaignId/")({
  component: () => (
    <CampaignDetailPage campaignId={Route.useParams().campaignId} />
  ),
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.CAMPAIGN_READ,
      redirectTo: "/forbidden",
    });
  },
});
