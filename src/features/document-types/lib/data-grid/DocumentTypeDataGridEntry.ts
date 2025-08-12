import { DataGridRowEntry } from "@/shared/types/data-grid"
import { DocumentsTypeDto } from "@/shared/api/types.gen"

export class DocumentTypeDataGridEntry implements DataGridRowEntry {
  constructor(private documentsType: DocumentsTypeDto) {}

  getId(): string {
    return this.documentsType.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    return this.documentsType[columnKey as keyof DocumentsTypeDto]?.toString() || ""
  }
}
