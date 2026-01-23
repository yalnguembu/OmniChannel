import { createFileRoute } from "@tanstack/react-router"
import { PricingsListPage } from "@/features/pricing/pages/PricingsListPage"

export const Route = createFileRoute("/_protected/pricing/")({
  component: PricingsListPage,
})
