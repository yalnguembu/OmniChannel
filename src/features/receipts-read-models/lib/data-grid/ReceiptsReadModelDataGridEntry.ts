import { DataGridRowEntry } from "@/shared/types/data-grid"
import { ReceiptsReadModelDto } from "@/shared/api/types.gen"
import { formatDate } from "@/shared/lib/date"

export class ReceiptsReadModelDataGridEntry implements DataGridRowEntry {
  constructor(private receiptsReadModel: ReceiptsReadModelDto) {}

  getId(): string {
    return this.receiptsReadModel.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    if (columnKey === "createdAt") {
      return formatDate(this.receiptsReadModel[columnKey as keyof ReceiptsReadModelDto]?.toString() || "")
    }
    return this.receiptsReadModel[columnKey as keyof ReceiptsReadModelDto]?.toString() || ""
  }
}
