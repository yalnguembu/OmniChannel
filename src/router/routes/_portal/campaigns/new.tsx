import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import { NewCampaignPage } from "@/pages/_portal/campaigns/NewCampaignPage";

const searchSchema = z.object({
  productId: z.string().optional(),
});

export const Route = createFileRoute("/_portal/campaigns/new")({
  validateSearch: (search) => searchSchema.parse(search),
  component: NewCampaignPage,
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.CAMPAIGN_WRITE,
      redirectTo: "/forbidden",
    });
  },
});
