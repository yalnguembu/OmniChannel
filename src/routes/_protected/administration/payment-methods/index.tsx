import { createFileRoute } from "@tanstack/react-router"
import { PaymentMethodsListPage } from "@/features/payment-methods/pages/PaymentMethodsListPage"

export const Route = createFileRoute("/_protected/administration/payment-methods/")({
  component: PaymentMethodsListPage,
})
