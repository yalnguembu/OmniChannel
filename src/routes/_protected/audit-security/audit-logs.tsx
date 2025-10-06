import { createFileRoute } from "@tanstack/react-router"
import { AuditLogsListPage } from "@/features/audit-logs/pages/AuditLogsListPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/audit-security/audit-logs")({
  beforeLoad: createPermissionGuard("AUDITLOG_VIEW"),
  pendingComponent: PageLoader,
  component: AuditLogsListPage,
})
