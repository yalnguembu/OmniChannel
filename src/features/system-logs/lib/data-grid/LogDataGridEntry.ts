import { DataGridRowEntry } from "@/shared/types/data-grid"
import { LogDto } from "@/shared/api/types.gen"
import { formatDate } from "@/shared/lib/date"

export class LogDataGridEntry implements DataGridRowEntry {
  constructor(private log: LogDto) {}

  getId(): string {
    return this.log.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    if (columnKey === "createdAt") {
      return formatDate(this.log[columnKey as keyof LogDto]?.toString() || "")
    }
    return this.log[columnKey as keyof LogDto]?.toString() || ""
  }
}
