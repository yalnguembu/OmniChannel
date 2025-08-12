import { createFileRoute } from "@tanstack/react-router"
import { AuditLogsListPage } from "@/features/audit-logs/pages/AuditLogsListPage"

export const Route = createFileRoute("/_protected/audit-security/audit-logs")({
  component: AuditLogsListPage,
})
