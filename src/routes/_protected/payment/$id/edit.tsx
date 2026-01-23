import { createFileRoute } from "@tanstack/react-router"
import { EditPaymentPage } from "@/features/payment/pages/EditPaymentPage"

export const Route = createFileRoute("/_protected/payment/$id/edit")({
  component: EditPaymentPage,
})
