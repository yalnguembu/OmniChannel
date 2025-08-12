import { DataGridRowEntry } from "@/shared/types/data-grid"
// import { formatDate, formatDateTime } from '@/shared/lib/date-utils'
import { FundTransfersReadModelDto } from "@/shared/api/types.gen"
// import { zSearchFundTransfersReadModelRequest } from '@/shared/api/zod.gen'

export class FundTransfersReadModelDataGridEntry implements DataGridRowEntry {
  constructor(private fundTransfersReadModel: FundTransfersReadModelDto) {}

  getId(): string {
    return this.fundTransfersReadModel.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    // const schemaShape = zFundTransfersReadModel._def.shape()
    // const zodType = schemaShape[columnKey]
    // const value = this.fundTransfersReadModel[columnKey]
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
    return this.fundTransfersReadModel[columnKey as keyof FundTransfersReadModelDto]?.toString() || ""
  }
}
