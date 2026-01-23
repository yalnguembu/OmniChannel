import { createFileRoute } from "@tanstack/react-router"
import { WebhookEndpointDetailsPage } from "@/features/webhookEndpoint/pages/WebhookEndpointDetailsPage"

export const Route = createFileRoute("/_protected/webhookEndpoint/$id/")({
  component: WebhookEndpointDetailsPage,
})
