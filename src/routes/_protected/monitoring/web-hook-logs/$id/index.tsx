import { createFileRoute } from "@tanstack/react-router"
import { WebhookLogDetailsPage } from "@/features/webhook-logs/components/WebhookLogDetailsPage"

export const Route = createFileRoute("/_protected/monitoring/web-hook-logs/$id/")({
  component: WebhookLogDetailsPage,
})
