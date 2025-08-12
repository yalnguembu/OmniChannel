import { createFileRoute } from "@tanstack/react-router"
import { WebhooksListPage } from "@/features/webhooks/pages/WebhooksListPage"

export const Route = createFileRoute("/_protected/webhooks")({
  component: WebhooksListPage,
})
