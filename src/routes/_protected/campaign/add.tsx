import { createFileRoute } from "@tanstack/react-router"
import { CreateCampaignPage } from "@/features/campaign/pages/CreateCampaignPage"

export const Route = createFileRoute("/_protected/campaign/add")({
  component: CreateCampaignPage,
})
