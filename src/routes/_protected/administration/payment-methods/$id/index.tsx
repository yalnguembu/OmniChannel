import { createFileRoute } from "@tanstack/react-router"
import { PaymentMethodDetailsPage } from "@/features/payment-methods/pages/PaymentMethodDetailsPage"

export const Route = createFileRoute("/_protected/administration/payment-methods/$id/")({
  component: PaymentMethodDetailsPage,
})
