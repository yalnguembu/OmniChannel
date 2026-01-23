import { createFileRoute } from "@tanstack/react-router"
import { PaymentsListPage } from "@/features/payment/pages/PaymentsListPage"

export const Route = createFileRoute("/_protected/payment/")({
  component: PaymentsListPage,
})
