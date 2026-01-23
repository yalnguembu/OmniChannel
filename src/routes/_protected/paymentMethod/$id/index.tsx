import { createFileRoute } from "@tanstack/react-router"
import { PaymentMethodDetailsPage } from "@/features/paymentMethod/pages/PaymentMethodDetailsPage"

export const Route = createFileRoute("/_protected/paymentMethod/$id/")({
  component: PaymentMethodDetailsPage,
})
