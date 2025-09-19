import { DataGridRowEntry } from "@/shared/types/data-grid"
import { formatDate } from "@/shared/lib/date"
import { CompanyDto } from "@/shared/api/types.gen"

export class CompanyDataGridEntry implements DataGridRowEntry {
  constructor(private company: CompanyDto) {}

  getId(): string {
    return this.company.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    if (columnKey === "createdAt") {
      return formatDate(this.company[columnKey as keyof CompanyDto]?.toString() || "")
    }
    return this.company[columnKey as keyof CompanyDto]?.toString() || ""
  }
}
