import { createFileRoute } from "@tanstack/react-router"
import { CampaignSegmentsListPage } from "@/features/campaignSegment/pages/CampaignSegmentsListPage"

export const Route = createFileRoute("/_protected/campaignSegment/")({
  component: CampaignSegmentsListPage,
})
