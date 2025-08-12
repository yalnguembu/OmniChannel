import { createFileRoute } from "@tanstack/react-router"
import { CreateWithdrawalMethodPage } from "@/features/withdrawal-methods/pages/CreateWithdrawalMethodPage"

export const Route = createFileRoute("/_protected/administration/withdrawal-methods/add")({
  component: CreateWithdrawalMethodPage,
})
