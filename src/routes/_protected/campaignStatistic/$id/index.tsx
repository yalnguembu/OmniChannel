import { createFileRoute } from "@tanstack/react-router"
import { CampaignStatisticDetailsPage } from "@/features/campaignStatistic/pages/CampaignStatisticDetailsPage"

export const Route = createFileRoute("/_protected/campaignStatistic/$id/")({
  component: CampaignStatisticDetailsPage,
})
