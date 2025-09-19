import { DataGridRowEntry } from "@/shared/types/data-grid"
import { formatDate } from "@/shared/lib/date"
import { NotificationDto } from "@/shared/api/types.gen"

export class NotificationDataGridEntry implements DataGridRowEntry {
  constructor(private notification: NotificationDto) {}

  getId(): string {
    return this.notification.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    if (columnKey === "createdAt") {
      return formatDate(this.notification[columnKey as keyof NotificationDto]?.toString() || "")
    }
    return this.notification[columnKey as keyof NotificationDto]?.toString() || ""
  }
}
