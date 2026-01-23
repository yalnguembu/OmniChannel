import { createFileRoute } from "@tanstack/react-router"
import { SubscriptionPlanDetailsPage } from "@/features/subscriptionPlan/pages/SubscriptionPlanDetailsPage"

export const Route = createFileRoute("/_protected/subscriptionPlan/$id/")({
  component: SubscriptionPlanDetailsPage,
})
