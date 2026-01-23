import { createFileRoute } from "@tanstack/react-router"
import { CreatePaymentMethodPage } from "@/features/paymentMethod/pages/CreatePaymentMethodPage"

export const Route = createFileRoute("/_protected/paymentMethod/add")({
  component: CreatePaymentMethodPage,
})
