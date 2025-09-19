import { DataGridRowEntry } from "@/shared/types/data-grid"
import { formatDate } from "@/shared/lib/date"
import { WebhookDto } from "@/shared/api/types.gen"

export class WebhookDataGridEntry implements DataGridRowEntry {
  constructor(private webhook: WebhookDto) {}

  getId(): string {
    return this.webhook.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    if (columnKey === "createdAt") {
      return formatDate(this.webhook[columnKey as keyof WebhookDto]?.toString() || "")
    }
    return this.webhook[columnKey as keyof WebhookDto]?.toString() || ""
  }
}
