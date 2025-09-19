import { DataGridRowEntry } from "@/shared/types/data-grid"
import { DocumentsTypeDto } from "@/shared/api/types.gen"
import { formatDate } from "@/shared/lib/date"

export class DocumentTypeDataGridEntry implements DataGridRowEntry {
  constructor(private documentsType: DocumentsTypeDto) {}

  getId(): string {
    return this.documentsType.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    if (columnKey === "createdAt") {
      return formatDate(this.documentsType[columnKey as keyof DocumentsTypeDto]?.toString() || "")
    }
    return this.documentsType[columnKey as keyof DocumentsTypeDto]?.toString() || ""
  }
}
