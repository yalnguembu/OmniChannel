import { createFileRoute } from "@tanstack/react-router"
import { CreatePaymentPage } from "@/features/payment/pages/CreatePaymentPage"

export const Route = createFileRoute("/_protected/payment/add")({
  component: CreatePaymentPage,
})
