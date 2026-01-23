import { createFileRoute } from "@tanstack/react-router"
import { SubscriptionPlansListPage } from "@/features/subscriptionPlan/pages/SubscriptionPlansListPage"

export const Route = createFileRoute("/_protected/subscriptionPlan/")({
  component: SubscriptionPlansListPage,
})
