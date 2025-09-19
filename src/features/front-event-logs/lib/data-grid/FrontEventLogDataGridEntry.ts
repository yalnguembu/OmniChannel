import { DataGridRowEntry } from "@/shared/types/data-grid"
import { formatDate } from "@/shared/lib/date"
import { FrontEventLogDto } from "@/shared/api/types.gen"

export class FrontEventLogDataGridEntry implements DataGridRowEntry {
  constructor(private frontEventLog: FrontEventLogDto) {}

  getId(): string {
    return this.frontEventLog.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    if (columnKey === "createdAt") {
      return formatDate(this.frontEventLog[columnKey as keyof FrontEventLogDto]?.toString() || "")
    }
    return this.frontEventLog[columnKey as keyof FrontEventLogDto]?.toString() || ""
  }
}
