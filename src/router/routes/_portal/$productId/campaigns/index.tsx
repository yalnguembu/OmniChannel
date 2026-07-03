import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import { CampaignsPage } from "@/pages/_portal/campaigns/CampaignsPage";

const searchSchema = z.object({
  create: z.boolean().optional(),
});

export const Route = createFileRoute(
  "/_portal/$productId/campaigns/",
)({
  validateSearch: (search) => searchSchema.parse(search),
  component: () => <CampaignsPage productId={Route.useParams().productId} />,
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.CAMPAIGN_READ,
      redirectTo: "/forbidden",
    });
  },
});
