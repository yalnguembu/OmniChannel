import { DataGridRowEntry } from "@/shared/types/data-grid"
import { UserDeviceDto } from "@/shared/api/types.gen"
import { formatDate } from "@/shared/lib/date"

export class UserDeviceDataGridEntry implements DataGridRowEntry {
  constructor(private userDevice: UserDeviceDto) {}

  getId(): string {
    return this.userDevice.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    if (columnKey === "createdAt") {
      return formatDate(this.userDevice[columnKey as keyof UserDeviceDto]?.toString() || "")
    }
    return this.userDevice[columnKey as keyof UserDeviceDto]?.toString() || ""
  }
}
