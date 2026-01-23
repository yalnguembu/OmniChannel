import { createFileRoute } from "@tanstack/react-router"
import { EditCampaignPage } from "@/features/campaign/pages/EditCampaignPage"

export const Route = createFileRoute("/_protected/campaign/$id/edit")({
  component: EditCampaignPage,
})
