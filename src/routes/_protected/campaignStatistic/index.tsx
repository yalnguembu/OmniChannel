import { createFileRoute } from "@tanstack/react-router"
import { CampaignStatisticsListPage } from "@/features/campaignStatistic/pages/CampaignStatisticsListPage"

export const Route = createFileRoute("/_protected/campaignStatistic/")({
  component: CampaignStatisticsListPage,
})
