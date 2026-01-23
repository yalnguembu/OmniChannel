import { createFileRoute } from "@tanstack/react-router"
import { EditPricingPage } from "@/features/pricing/pages/EditPricingPage"

export const Route = createFileRoute("/_protected/pricing/$id/edit")({
  component: EditPricingPage,
})
