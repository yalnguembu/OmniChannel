import { DataGridRowEntry } from "@/shared/types/data-grid"
import { formatDate } from "@/shared/lib/date"

import { VwTransactionsSummaryDto } from "@/shared/api/types.gen"

export class VwTransactionsSummaryDataGridEntry implements DataGridRowEntry {
  constructor(private vwTransactionsSummary: VwTransactionsSummaryDto) {}

  getId(): string {
    return this.vwTransactionsSummary.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    if (columnKey === "createdAt") {
      return formatDate(this.vwTransactionsSummary[columnKey as keyof VwTransactionsSummaryDto]?.toString() || "")
    }

    return this.vwTransactionsSummary[columnKey as keyof VwTransactionsSummaryDto]?.toString() || ""
  }
}
