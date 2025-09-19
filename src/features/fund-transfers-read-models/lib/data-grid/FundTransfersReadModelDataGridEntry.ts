import { DataGridRowEntry } from "@/shared/types/data-grid"
import { formatDate } from "@/shared/lib/date"
import { FundTransfersReadModelDto } from "@/shared/api/types.gen"

export class FundTransfersReadModelDataGridEntry implements DataGridRowEntry {
  constructor(private fundTransfersReadModel: FundTransfersReadModelDto) {}

  getId(): string {
    return this.fundTransfersReadModel.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    if (columnKey === "createdAt") {
      return formatDate(this.fundTransfersReadModel[columnKey as keyof FundTransfersReadModelDto]?.toString() || "")
    }
    return this.fundTransfersReadModel[columnKey as keyof FundTransfersReadModelDto]?.toString() || ""
  }
}
