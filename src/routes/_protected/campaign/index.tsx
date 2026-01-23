import { createFileRoute } from "@tanstack/react-router"
import { CampaignsListPage } from "@/features/campaign/pages/CampaignsListPage"

export const Route = createFileRoute("/_protected/campaign/")({
  component: CampaignsListPage,
})
