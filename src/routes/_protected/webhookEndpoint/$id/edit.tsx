import { createFileRoute } from "@tanstack/react-router"
import { EditWebhookEndpointPage } from "@/features/webhookEndpoint/pages/EditWebhookEndpointPage"

export const Route = createFileRoute("/_protected/webhookEndpoint/$id/edit")({
  component: EditWebhookEndpointPage,
})
