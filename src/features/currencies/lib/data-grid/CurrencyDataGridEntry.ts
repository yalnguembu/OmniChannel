import { DataGridRowEntry } from "@/shared/types/data-grid"
import { formatDate } from "@/shared/lib/date"
import { CurrencyDto } from "@/shared/api/types.gen"

export class CurrencyDataGridEntry implements DataGridRowEntry {
  constructor(private currency: CurrencyDto) {}

  getId(): string {
    return this.currency.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    if (columnKey === "createdAt") {
      return formatDate(this.currency[columnKey as keyof CurrencyDto]?.toString() || "")
    }
    return this.currency[columnKey as keyof CurrencyDto]?.toString() || ""
  }
}
