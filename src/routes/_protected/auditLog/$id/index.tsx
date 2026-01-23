import { createFileRoute } from "@tanstack/react-router"
import { AuditLogDetailsPage } from "@/features/auditLog/pages/AuditLogDetailsPage"

export const Route = createFileRoute("/_protected/auditLog/$id/")({
  component: AuditLogDetailsPage,
})
