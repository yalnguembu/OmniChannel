import { createFileRoute } from "@tanstack/react-router"
import { CreatePricingPage } from "@/features/pricing/pages/CreatePricingPage"

export const Route = createFileRoute("/_protected/pricing/add")({
  component: CreatePricingPage,
})
