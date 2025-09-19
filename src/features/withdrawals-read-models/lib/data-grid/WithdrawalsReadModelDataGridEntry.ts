import { DataGridRowEntry } from "@/shared/types/data-grid"
import { formatDate } from "@/shared/lib/date"
import { WithdrawalsReadModelDto } from "@/shared/api/types.gen"

export class WithdrawalsReadModelDataGridEntry implements DataGridRowEntry {
  constructor(private withdrawalsReadModel: WithdrawalsReadModelDto) {}

  getId(): string {
    return this.withdrawalsReadModel.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    if (columnKey === "createdAt") {
      return formatDate(this.withdrawalsReadModel[columnKey as keyof WithdrawalsReadModelDto]?.toString() || "")
    }
    return this.withdrawalsReadModel[columnKey as keyof WithdrawalsReadModelDto]?.toString() || ""
  }
}
