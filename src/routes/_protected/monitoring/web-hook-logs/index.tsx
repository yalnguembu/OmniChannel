import { createFileRoute } from "@tanstack/react-router"
import { WebhookLogsListPage } from "@/features/webhook-logs/pages/WebhookLogsListPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/monitoring/web-hook-logs/")({
  beforeLoad: createPermissionGuard("WEBHOOKLOG_VIEW"),
  pendingComponent: PageLoader,
  component: WebhookLogsListPage,
})
