import { createFileRoute } from "@tanstack/react-router"
import { EditPaymentMethodPage } from "@/features/payment-methods/pages/EditPaymentMethodPage"

export const Route = createFileRoute("/_protected/administration/payment-methods/$id/edit")({
  component: EditPaymentMethodPage,
})
