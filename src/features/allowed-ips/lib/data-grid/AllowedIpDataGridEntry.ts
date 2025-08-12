import { DataGridRowEntry } from "@/shared/types/data-grid"
// import { formatDate, formatDateTime } from '@/shared/lib/date-utils'
import { AllowedIpDto } from "@/shared/api/types.gen"
// import { zSearchAllowedIpRequest } from '@/shared/api/zod.gen'

export class AllowedIpDataGridEntry implements DataGridRowEntry {
  constructor(private allowedIp: AllowedIpDto) {}

  getId(): string {
    return this.allowedIp.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    // const schemaShape = zAllowedIp._def.shape()
    // const zodType = schemaShape[columnKey]
    // const value = this.allowedIp[columnKey]
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
    return this.allowedIp[columnKey as keyof AllowedIpDto]?.toString() || ""
  }
}
