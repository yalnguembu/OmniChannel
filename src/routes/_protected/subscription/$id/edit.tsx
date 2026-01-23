import { createFileRoute } from "@tanstack/react-router"
import { EditSubscriptionPage } from "@/features/subscription/pages/EditSubscriptionPage"

export const Route = createFileRoute("/_protected/subscription/$id/edit")({
  component: EditSubscriptionPage,
})
