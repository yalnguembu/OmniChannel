import { createFileRoute } from "@tanstack/react-router"
import { CreateSubscriptionPage } from "@/features/subscription/pages/CreateSubscriptionPage"

export const Route = createFileRoute("/_protected/subscription/add")({
  component: CreateSubscriptionPage,
})
