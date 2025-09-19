import { DataGridRowEntry } from "@/shared/types/data-grid"
import { formatDate } from "@/shared/lib/date"

import { WebhookLogDto } from "@/shared/api/types.gen"

export class WebhookLogDataGridEntry implements DataGridRowEntry {
  constructor(private webhookLog: WebhookLogDto) {}

  getId(): string {
    return this.webhookLog.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    if (columnKey === "createdAt") {
      return formatDate(this.webhookLog[columnKey as keyof WebhookLogDto]?.toString() || "")
    }

    return this.webhookLog[columnKey as keyof WebhookLogDto]?.toString() || ""
  }
}
