import { createFileRoute } from "@tanstack/react-router"
import { AuditLogsListPage } from "@/features/auditLog/pages/AuditLogsListPage"

export const Route = createFileRoute("/_protected/auditLog/")({
  component: AuditLogsListPage,
})
