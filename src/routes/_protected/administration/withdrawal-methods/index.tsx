import { createFileRoute } from "@tanstack/react-router"
import { WithdrawalMethodsListPage } from "@/features/withdrawal-methods/pages/WithdrawalMethodsListPage"

export const Route = createFileRoute("/_protected/administration/withdrawal-methods/")({
  component: WithdrawalMethodsListPage,
})
