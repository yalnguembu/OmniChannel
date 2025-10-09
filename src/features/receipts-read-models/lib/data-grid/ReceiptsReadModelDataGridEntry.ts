import { DataGridRowEntry } from "@/shared/types/data-grid"
import { ReceiptsReadModelDto } from "@/shared/api/types.gen"
import { formatDate } from "@/shared/lib/date"
import { DateFormat } from "@/shared/enums/common"

export class ReceiptsReadModelDataGridEntry implements DataGridRowEntry {
  constructor(private receiptsReadModel: ReceiptsReadModelDto) {}

  getId(): string {
    return this.receiptsReadModel.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    if (columnKey === "createdAt") {
      return formatDate(this.receiptsReadModel[columnKey as keyof ReceiptsReadModelDto]?.toString() || "", DateFormat.DATETIME_SHORT)
    }
    return this.receiptsReadModel[columnKey as keyof ReceiptsReadModelDto]?.toString() || ""
  }
}
