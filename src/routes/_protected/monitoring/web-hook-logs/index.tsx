import { createFileRoute } from "@tanstack/react-router"
import { WebhookLogsListPage } from "@/features/webhook-logs/pages/WebhookLogsListPage"

export const Route = createFileRoute("/_protected/monitoring/web-hook-logs/")({
  component: WebhookLogsListPage,
})
