import { DataGridRowEntry } from "@/shared/types/data-grid"
import { formatDate } from "@/shared/lib/date"
import { BlockedIpDto } from "@/shared/api/types.gen"

export class BlockedIpDataGridEntry implements DataGridRowEntry {
  constructor(private blockedIp: BlockedIpDto) {}

  getId(): string {
    return this.blockedIp.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    if (columnKey === "createdAt") {
      return formatDate(this.blockedIp[columnKey as keyof BlockedIpDto]?.toString() || "")
    }
    return this.blockedIp[columnKey as keyof BlockedIpDto]?.toString() || ""
  }
}
