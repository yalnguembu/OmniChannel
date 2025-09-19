import { DataGridRowEntry } from "@/shared/types/data-grid"
import { formatDate } from "@/shared/lib/date"
import { FeeTypeDto } from "@/shared/api/types.gen"

export class FeeTypeDataGridEntry implements DataGridRowEntry {
  constructor(private feeType: FeeTypeDto) {}

  getId(): string {
    return this.feeType.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    if (columnKey === "createdAt") {
      return formatDate(this.feeType[columnKey as keyof FeeTypeDto]?.toString() || "")
    }
    return this.feeType[columnKey as keyof FeeTypeDto]?.toString() || ""
  }
}
