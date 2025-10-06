import { createFileRoute } from "@tanstack/react-router"
import { FrontEventLogsListPage } from "@/features/front-event-logs/pages/FrontEventLogsListPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/monitoring/front-events/")({
  beforeLoad: createPermissionGuard("FRONTEVENTLOG_VIEW"),
  pendingComponent: PageLoader,
  component: FrontEventLogsListPage,
})
