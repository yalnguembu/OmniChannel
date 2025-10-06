import { createFileRoute } from "@tanstack/react-router"
import { LogsListPage } from "@/features/system-logs/pages/LogsListPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/monitoring/system-logs")({
  beforeLoad: createPermissionGuard("LOG_VIEW"),
  pendingComponent: PageLoader,
  component: LogsListPage,
})
