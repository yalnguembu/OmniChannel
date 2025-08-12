import { createFileRoute } from "@tanstack/react-router"
import { FundTransfersReadModelsListPage } from "@/features/fund-transfers-read-models/pages/FundTransfersReadModelsListPage"

export const Route = createFileRoute("/_protected/fund-transfers")({
  component: FundTransfersReadModelsListPage,
})
