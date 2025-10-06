import { createFileRoute } from "@tanstack/react-router"
import { WebhooksListPage } from "@/features/webhooks/pages/WebhooksListPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/webhooks")({
  beforeLoad: createPermissionGuard("WEBHOOK_VIEW"),
  pendingComponent: PageLoader,
  component: WebhooksListPage,
})
