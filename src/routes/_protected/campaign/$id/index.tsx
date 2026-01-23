import { createFileRoute } from "@tanstack/react-router"
import { CampaignDetailsPage } from "@/features/campaign/pages/CampaignDetailsPage"

export const Route = createFileRoute("/_protected/campaign/$id/")({
  component: CampaignDetailsPage,
})
