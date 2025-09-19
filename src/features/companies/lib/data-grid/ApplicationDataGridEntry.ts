import { DataGridRowEntry } from "@/shared/types/data-grid"
import { formatDate } from "@/shared/lib/date"
import { ApplicationDto } from "@/shared/api/types.gen"

export class ApplicationDataGridEntry implements DataGridRowEntry {
  constructor(private application: ApplicationDto) {}

  getId(): string {
    return this.application.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    if (columnKey === "createdAt") {
      return formatDate(this.application[columnKey as keyof ApplicationDto]?.toString() || "")
    }
    return this.application[columnKey as keyof ApplicationDto]?.toString() || ""
  }
}
