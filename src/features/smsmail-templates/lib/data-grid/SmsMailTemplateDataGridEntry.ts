import { DataGridRowEntry } from "@/shared/types/data-grid"
import { SmsmailTemplateDto } from "@/shared/api/types.gen"
import { formatDate } from "@/shared/lib/date"

export class SmsmailTemplateDataGridEntry implements DataGridRowEntry {
  constructor(private smsmailTemplate: SmsmailTemplateDto) {}

  getId(): string {
    return this.smsmailTemplate.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    if (columnKey === "createdAt") {
      return formatDate(this.smsmailTemplate[columnKey as keyof SmsmailTemplateDto]?.toString() || "")
    }
    return this.smsmailTemplate[columnKey as keyof SmsmailTemplateDto]?.toString() || ""
  }
}
