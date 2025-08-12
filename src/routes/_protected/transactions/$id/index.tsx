import { createFileRoute } from "@tanstack/react-router"
import { VwTransactionsSummaryDetailsPage } from "@/features/vw-transactions-summarys/pages/VwTransactionsSummaryDetailsPage"

export const Route = createFileRoute("/_protected/transactions/$id/")({
  component: VwTransactionsSummaryDetailsPage,
})
