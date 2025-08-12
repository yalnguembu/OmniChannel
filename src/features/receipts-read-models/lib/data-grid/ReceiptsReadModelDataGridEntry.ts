import { DataGridRowEntry } from "@/shared/types/data-grid"
// import { formatDate, formatDateTime } from '@/shared/lib/date-utils'
import { ReceiptsReadModelDto } from "@/shared/api/types.gen"
// import { zSearchReceiptsReadModelRequest } from '@/shared/api/zod.gen'

export class ReceiptsReadModelDataGridEntry implements DataGridRowEntry {
  constructor(private receiptsReadModel: ReceiptsReadModelDto) {}

  getId(): string {
    return this.receiptsReadModel.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    // const schemaShape = zReceiptsReadModel._def.shape()
    // const zodType = schemaShape[columnKey]
    // const value = this.receiptsReadModel[columnKey]
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
    return this.receiptsReadModel[columnKey as keyof ReceiptsReadModelDto]?.toString() || ""
  }
}
