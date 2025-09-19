import { DataGridRowEntry } from "@/shared/types/data-grid"
import { formatDate } from "@/shared/lib/date"
import { FeeConfigurationDto } from "@/shared/api/types.gen"

export class FeeConfigurationDataGridEntry implements DataGridRowEntry {
  constructor(private feeConfiguration: FeeConfigurationDto) {}

  getId(): string {
    return this.feeConfiguration.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    if (columnKey === "createdAt") {
      return formatDate(this.feeConfiguration[columnKey as keyof FeeConfigurationDto]?.toString() || "")
    }
    return this.feeConfiguration[columnKey as keyof FeeConfigurationDto]?.toString() || ""
  }
}
