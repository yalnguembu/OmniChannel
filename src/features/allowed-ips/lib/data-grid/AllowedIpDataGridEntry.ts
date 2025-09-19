import { DataGridRowEntry } from "@/shared/types/data-grid"
import { formatDate } from "@/shared/lib/date"
import { AllowedIpDto } from "@/shared/api/types.gen"

export class AllowedIpDataGridEntry implements DataGridRowEntry {
  constructor(private allowedIp: AllowedIpDto) {}

  getId(): string {
    return this.allowedIp.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    if (columnKey === "createdAt") {
      return formatDate(this.allowedIp[columnKey as keyof AllowedIpDto]?.toString() || "")
    }
    return this.allowedIp[columnKey as keyof AllowedIpDto]?.toString() || ""
  }
}
