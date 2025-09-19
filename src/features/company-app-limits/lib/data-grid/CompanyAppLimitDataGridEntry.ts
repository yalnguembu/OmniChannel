import { DataGridRowEntry } from "@/shared/types/data-grid"
import { formatDate } from "@/shared/lib/date"
import { CompanyAppLimitDto } from "@/shared/api/types.gen"

export class CompanyAppLimitDataGridEntry implements DataGridRowEntry {
  constructor(private companyAppLimit: CompanyAppLimitDto) {}

  getId(): string {
    return this.companyAppLimit.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    if (columnKey === "createdAt") {
      return formatDate(this.companyAppLimit[columnKey as keyof CompanyAppLimitDto]?.toString() || "")
    }
    return this.companyAppLimit[columnKey as keyof CompanyAppLimitDto]?.toString() || ""
  }
}
