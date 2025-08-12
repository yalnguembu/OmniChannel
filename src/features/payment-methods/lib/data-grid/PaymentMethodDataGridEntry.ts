import { DataGridRowEntry } from "@/shared/types/data-grid"
// import { formatDate, formatDateTime } from '@/shared/lib/date-utils'
import { PaymentMethodDto } from "@/shared/api/types.gen"
// import { zSearchPaymentMethodRequest } from '@/shared/api/zod.gen'

export class PaymentMethodDataGridEntry implements DataGridRowEntry {
  constructor(private paymentMethod: PaymentMethodDto) {}

  getId(): string {
    return this.paymentMethod.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    // const schemaShape = zPaymentMethod._def.shape()
    // const zodType = schemaShape[columnKey]
    // const value = this.paymentMethod[columnKey]
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
    return this.paymentMethod[columnKey as keyof PaymentMethodDto]?.toString() || ""
  }
}
