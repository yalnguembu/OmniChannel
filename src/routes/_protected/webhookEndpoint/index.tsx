import { createFileRoute } from "@tanstack/react-router"
import { WebhookEndpointsListPage } from "@/features/webhookEndpoint/pages/WebhookEndpointsListPage"

export const Route = createFileRoute("/_protected/webhookEndpoint/")({
  component: WebhookEndpointsListPage,
})
