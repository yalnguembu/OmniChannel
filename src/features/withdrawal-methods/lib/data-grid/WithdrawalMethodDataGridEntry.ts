import { DataGridRowEntry } from "@/shared/types/data-grid"
import { formatDate } from "@/shared/lib/date"
import { WithdrawalMethodDto } from "@/shared/api/types.gen"

export class WithdrawalMethodDataGridEntry implements DataGridRowEntry {
  constructor(private withdrawalMethod: WithdrawalMethodDto) {}

  getId(): string {
    return this.withdrawalMethod.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    if (columnKey === "createdAt") {
      return formatDate(this.withdrawalMethod[columnKey as keyof WithdrawalMethodDto]?.toString() || "")
    }
    return this.withdrawalMethod[columnKey as keyof WithdrawalMethodDto]?.toString() || ""
  }
}
