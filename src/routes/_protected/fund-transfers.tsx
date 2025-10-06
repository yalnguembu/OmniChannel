import { createFileRoute } from "@tanstack/react-router"
import { FundTransfersReadModelsListPage } from "@/features/fund-transfers-read-models/pages/FundTransfersReadModelsListPage"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/fund-transfers")({
  pendingComponent: PageLoader,
  component: FundTransfersReadModelsListPage,
})
