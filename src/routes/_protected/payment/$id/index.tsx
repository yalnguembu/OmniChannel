import { createFileRoute } from "@tanstack/react-router"
import { PaymentDetailsPage } from "@/features/payment/pages/PaymentDetailsPage"

export const Route = createFileRoute("/_protected/payment/$id/")({
  component: PaymentDetailsPage,
})
