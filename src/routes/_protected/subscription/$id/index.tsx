import { createFileRoute } from "@tanstack/react-router"
import { SubscriptionDetailsPage } from "@/features/subscription/pages/SubscriptionDetailsPage"

export const Route = createFileRoute("/_protected/subscription/$id/")({
  component: SubscriptionDetailsPage,
})
