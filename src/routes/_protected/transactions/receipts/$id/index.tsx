import { createFileRoute } from "@tanstack/react-router"
import { ReceiptsReadModelsListPage } from "@/features/receipts-read-models/pages/ReceiptsReadModelsListPage"

export const Route = createFileRoute("/_protected/transactions/receipts/$id/")({
  component: ReceiptsReadModelsListPage,
})
