import { createFileRoute } from "@tanstack/react-router"
import { PaymentMethodsListPage } from "@/features/paymentMethod/pages/PaymentMethodsListPage"

export const Route = createFileRoute("/_protected/paymentMethod/")({
  component: PaymentMethodsListPage,
})
