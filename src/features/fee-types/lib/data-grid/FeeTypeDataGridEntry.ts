import { DataGridRowEntry } from "@/shared/types/data-grid"
// import { formatDate, formatDateTime } from '@/shared/lib/date-utils'
import { FeeTypeDto } from "@/shared/api/types.gen"
// import { zSearchFeeTypeRequest } from '@/shared/api/zod.gen'

export class FeeTypeDataGridEntry implements DataGridRowEntry {
  constructor(private feeType: FeeTypeDto) {}

  getId(): string {
    return this.feeType.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    // const schemaShape = zFeeType._def.shape()
    // const zodType = schemaShape[columnKey]
    // const value = this.feeType[columnKey]
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
    return this.feeType[columnKey as keyof FeeTypeDto]?.toString() || ""
  }
}
