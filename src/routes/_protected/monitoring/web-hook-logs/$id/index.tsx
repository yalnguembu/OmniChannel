import { createFileRoute } from "@tanstack/react-router"
import { WebhookLogDetailsPage } from "@/features/webhook-logs/components/WebhookLogDetailsPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/monitoring/web-hook-logs/$id/")({
  beforeLoad: createPermissionGuard("WEBHOOKLOG_VIEW"),
  pendingComponent: PageLoader,
  component: WebhookLogDetailsPage,
})
