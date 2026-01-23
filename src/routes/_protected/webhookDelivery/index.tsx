import { createFileRoute } from "@tanstack/react-router"
import { WebhookDeliverysListPage } from "@/features/webhookDelivery/pages/WebhookDeliverysListPage"

export const Route = createFileRoute("/_protected/webhookDelivery/")({
  component: WebhookDeliverysListPage,
})
