import { DataGridRowEntry } from "@/shared/types/data-grid"
// import { formatDate, formatDateTime } from '@/shared/lib/date-utils'
import { WithdrawalsReadModelDto } from "@/shared/api/types.gen"
// import { zSearchWithdrawalsReadModelRequest } from '@/shared/api/zod.gen'

export class WithdrawalsReadModelDataGridEntry implements DataGridRowEntry {
  constructor(private withdrawalsReadModel: WithdrawalsReadModelDto) {}

  getId(): string {
    return this.withdrawalsReadModel.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    // const schemaShape = zWithdrawalsReadModel._def.shape()
    // const zodType = schemaShape[columnKey]
    // const value = this.withdrawalsReadModel[columnKey]
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
    return this.withdrawalsReadModel[columnKey as keyof WithdrawalsReadModelDto]?.toString() || ""
  }
}
