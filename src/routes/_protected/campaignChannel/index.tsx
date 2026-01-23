import { createFileRoute } from "@tanstack/react-router"
import { CampaignChannelsListPage } from "@/features/campaignChannel/pages/CampaignChannelsListPage"

export const Route = createFileRoute("/_protected/campaignChannel/")({
  component: CampaignChannelsListPage,
})
