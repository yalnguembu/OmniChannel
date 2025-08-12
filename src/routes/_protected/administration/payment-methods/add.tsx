import { createFileRoute } from "@tanstack/react-router"
import { CreatePaymentMethodPage } from "@/features/payment-methods/pages/CreatePaymentMethodPage"

export const Route = createFileRoute("/_protected/administration/payment-methods/add")({
  component: CreatePaymentMethodPage,
})
