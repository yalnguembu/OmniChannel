import { DataGridRowEntry } from "@/shared/types/data-grid"
// import { formatDate, formatDateTime } from '@/shared/lib/date-utils'
import { KycDocumentDto } from "@/shared/api/types.gen"
// import { zSearchKycDocumentRequest } from '@/shared/api/zod.gen'

export class KycDocumentDataGridEntry implements DataGridRowEntry {
  constructor(private kycDocument: KycDocumentDto) {}

  getId(): string {
    return this.kycDocument.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    // const schemaShape = zKycDocument._def.shape()
    // const zodType = schemaShape[columnKey]
    // const value = this.kycDocument[columnKey]
    //
    // if (!zodType) return '-'
    // const typeName = zodType?._def?.typeName
    //
    // if (typeName === 'ZodDate') {
    //   return value ? formatDate(value) : '-'
    // }
    // if (typeName === 'ZodString' && columnKey.toLowerCase().includes('date')) {
    //   return value ? formatDateTime(value) : '-'
    // }
    // if (typeName === 'ZodNumber' || typeName === 'ZodBigInt') {
    //   return value?.toString() || '-'
    // }
    // if (typeName === 'ZodObject' && value && value.name) {
    //   return value.name
    // }
    // return value || '-'
    return this.kycDocument[columnKey as keyof KycDocumentDto]?.toString() || ""
  }
}
