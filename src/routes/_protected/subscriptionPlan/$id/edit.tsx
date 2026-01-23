import { createFileRoute } from "@tanstack/react-router"
import { EditSubscriptionPlanPage } from "@/features/subscriptionPlan/pages/EditSubscriptionPlanPage"

export const Route = createFileRoute("/_protected/subscriptionPlan/$id/edit")({
  component: EditSubscriptionPlanPage,
})
