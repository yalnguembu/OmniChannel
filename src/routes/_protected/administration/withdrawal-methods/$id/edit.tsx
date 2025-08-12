import { createFileRoute } from "@tanstack/react-router"
import { EditWithdrawalMethodPage } from "@/features/withdrawal-methods/pages/EditWithdrawalMethodPage"

export const Route = createFileRoute("/_protected/administration/withdrawal-methods/$id/edit")({
  component: EditWithdrawalMethodPage,
})
