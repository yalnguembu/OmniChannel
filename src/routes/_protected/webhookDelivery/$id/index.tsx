import { createFileRoute } from "@tanstack/react-router"
import { WebhookDeliveryDetailsPage } from "@/features/webhookDelivery/pages/WebhookDeliveryDetailsPage"

export const Route = createFileRoute("/_protected/webhookDelivery/$id/")({
  component: WebhookDeliveryDetailsPage,
})
