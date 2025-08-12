import { createFileRoute } from "@tanstack/react-router"
import { WithdrawalsReadModelsListPage } from "@/features/withdrawals-read-models/pages/WithdrawalsReadModelsListPage"

export const Route = createFileRoute("/_protected/transactions/withdrawals/")({
  component: WithdrawalsReadModelsListPage,
})
