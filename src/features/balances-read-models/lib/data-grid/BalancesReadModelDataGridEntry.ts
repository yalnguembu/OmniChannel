import { DataGridRowEntry } from "@/shared/types/data-grid"
import { formatDate } from "@/shared/lib/date"
import { BalancesReadModelDto } from "@/shared/api/types.gen"

export class BalancesReadModelDataGridEntry implements DataGridRowEntry {
  constructor(private balancesReadModel: BalancesReadModelDto) {}

  getId(): string {
    return this.balancesReadModel.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    if (columnKey === "createdAt") {
      return formatDate(this.balancesReadModel[columnKey as keyof BalancesReadModelDto]?.toString() || "")
    }
    return this.balancesReadModel[columnKey as keyof BalancesReadModelDto]?.toString() || ""
  }
}
