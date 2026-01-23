import { createFileRoute } from "@tanstack/react-router"
import { CreateWebhookEndpointPage } from "@/features/webhookEndpoint/pages/CreateWebhookEndpointPage"

export const Route = createFileRoute("/_protected/webhookEndpoint/add")({
  component: CreateWebhookEndpointPage,
})
