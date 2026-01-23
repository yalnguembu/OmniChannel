import { createFileRoute } from "@tanstack/react-router"
import { EditPaymentMethodPage } from "@/features/paymentMethod/pages/EditPaymentMethodPage"

export const Route = createFileRoute("/_protected/paymentMethod/$id/edit")({
  component: EditPaymentMethodPage,
})
