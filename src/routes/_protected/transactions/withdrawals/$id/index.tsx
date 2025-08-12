import { createFileRoute } from "@tanstack/react-router"
import { WithdrawalsReadModelDetailsPage } from "@/features/withdrawals-read-models/pages/WithdrawalsReadModelDetailsPage"

export const Route = createFileRoute("/_protected/transactions/withdrawals/$id/")({
  component: WithdrawalsReadModelDetailsPage,
})
