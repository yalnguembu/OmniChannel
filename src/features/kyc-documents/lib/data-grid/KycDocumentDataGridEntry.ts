import { DataGridRowEntry } from "@/shared/types/data-grid"
import { formatDate } from "@/shared/lib/date"
import { KycDocumentDto } from "@/shared/api/types.gen"

export class KycDocumentDataGridEntry implements DataGridRowEntry {
  constructor(private kycDocument: KycDocumentDto) {}

  getId(): string {
    return this.kycDocument.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    if (columnKey === "createdAt") {
      return formatDate(this.kycDocument[columnKey as keyof KycDocumentDto]?.toString() || "")
    }
    return this.kycDocument[columnKey as keyof KycDocumentDto]?.toString() || ""
  }
}
