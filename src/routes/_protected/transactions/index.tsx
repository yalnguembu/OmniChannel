import { createFileRoute } from "@tanstack/react-router"
import { VwTransactionsSummarysListPage } from "@/features/vw-transactions-summarys/pages/VwTransactionsSummarysListPage"

export const Route = createFileRoute("/_protected/transactions/")({
  component: VwTransactionsSummarysListPage,
})
