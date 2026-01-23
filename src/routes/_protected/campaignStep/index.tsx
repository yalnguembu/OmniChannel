import { createFileRoute } from "@tanstack/react-router"
import { CampaignStepsListPage } from "@/features/campaignStep/pages/CampaignStepsListPage"

export const Route = createFileRoute("/_protected/campaignStep/")({
  component: CampaignStepsListPage,
})
