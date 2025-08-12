import { DataGridRowEntry } from "@/shared/types/data-grid"
// import { formatDate, formatDateTime } from '@/shared/lib/date-utils'
import { WithdrawalMethodDto } from "@/shared/api/types.gen"
// import { zSearchWithdrawalMethodRequest } from '@/shared/api/zod.gen'

export class WithdrawalMethodDataGridEntry implements DataGridRowEntry {
  constructor(private withdrawalMethod: WithdrawalMethodDto) {}

  getId(): string {
    return this.withdrawalMethod.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    // const schemaShape = zWithdrawalMethod._def.shape()
    // const zodType = schemaShape[columnKey]
    // const value = this.withdrawalMethod[columnKey]
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
    return this.withdrawalMethod[columnKey as keyof WithdrawalMethodDto]?.toString() || ""
  }
}
