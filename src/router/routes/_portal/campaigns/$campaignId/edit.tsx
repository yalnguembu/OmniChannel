import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import { EditCampaignPage } from "@/pages/_portal/campaigns/EditCampaignPage";

export const Route = createFileRoute("/_portal/campaigns/$campaignId/edit")({
  component: () => (
    <EditCampaignPage campaignId={Route.useParams().campaignId} />
  ),
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.CAMPAIGN_EDIT,
      redirectTo: "/forbidden",
    });
  },
});
