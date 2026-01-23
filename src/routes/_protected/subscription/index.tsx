import { createFileRoute } from "@tanstack/react-router"
import { SubscriptionsListPage } from "@/features/subscription/pages/SubscriptionsListPage"

export const Route = createFileRoute("/_protected/subscription/")({
  component: SubscriptionsListPage,
})
