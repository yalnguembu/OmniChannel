import { createFileRoute } from "@tanstack/react-router"
import { PricingDetailsPage } from "@/features/pricing/pages/PricingDetailsPage"

export const Route = createFileRoute("/_protected/pricing/$id/")({
  component: PricingDetailsPage,
})
