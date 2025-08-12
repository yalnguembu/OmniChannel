import { DataGridRowEntry } from "@/shared/types/data-grid"
// import { formatDate, formatDateTime } from '@/shared/lib/date-utils'
import { BalancesReadModelDto } from "@/shared/api/types.gen"
// import { zSearchBalancesReadModelRequest } from '@/shared/api/zod.gen'

export class BalancesReadModelDataGridEntry implements DataGridRowEntry {
  constructor(private balancesReadModel: BalancesReadModelDto) {}

  getId(): string {
    return this.balancesReadModel.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    // const schemaShape = zBalancesReadModel._def.shape()
    // const zodType = schemaShape[columnKey]
    // const value = this.balancesReadModel[columnKey]
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
    return this.balancesReadModel[columnKey as keyof BalancesReadModelDto]?.toString() || ""
  }
}
