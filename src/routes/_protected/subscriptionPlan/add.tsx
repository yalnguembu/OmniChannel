import { createFileRoute } from "@tanstack/react-router"
import { CreateSubscriptionPlanPage } from "@/features/subscriptionPlan/pages/CreateSubscriptionPlanPage"

export const Route = createFileRoute("/_protected/subscriptionPlan/add")({
  component: CreateSubscriptionPlanPage,
})
