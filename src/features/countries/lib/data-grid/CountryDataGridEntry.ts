import { DataGridRowEntry } from "@/shared/types/data-grid"
import { formatDate } from "@/shared/lib/date"
import { CountryDto } from "@/shared/api/types.gen"

export class CountryDataGridEntry implements DataGridRowEntry {
  constructor(private country: CountryDto) {}

  getId(): string {
    return this.country.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    if (columnKey === "createdAt") {
      return formatDate(this.country[columnKey as keyof CountryDto]?.toString() || "")
    }
    return this.country[columnKey as keyof CountryDto]?.toString() || ""
  }
}
