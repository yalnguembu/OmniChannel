import { DataGridRowEntry } from "@/shared/types/data-grid"
import { formatDate } from "@/shared/lib/date"
import { AuditLogDto } from "@/shared/api/types.gen"

export class AuditLogDataGridEntry implements DataGridRowEntry {
  constructor(private auditLog: AuditLogDto) {}

  getId(): string {
    return this.auditLog.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    if (columnKey === "createdAt") {
      return formatDate(this.auditLog[columnKey as keyof AuditLogDto]?.toString() || "")
    }
    return this.auditLog[columnKey as keyof AuditLogDto]?.toString() || ""
  }
}
