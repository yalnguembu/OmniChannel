import { DataGridRowEntry } from "@/shared/types/data-grid"
// import { formatDate, formatDateTime } from '@/shared/lib/date-utils'
import { CurrencyDto } from "@/shared/api/types.gen"
// import { zSearchCurrencyRequest } from '@/shared/api/zod.gen'

export class CurrencyDataGridEntry implements DataGridRowEntry {
  constructor(private currency: CurrencyDto) {}

  getId(): string {
    return this.currency.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    // const schemaShape = zCurrency._def.shape()
    // const zodType = schemaShape[columnKey]
    // const value = this.currency[columnKey]
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
    return this.currency[columnKey as keyof CurrencyDto]?.toString() || ""
  }
}
