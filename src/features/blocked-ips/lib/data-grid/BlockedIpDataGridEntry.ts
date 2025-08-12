import { DataGridRowEntry } from "@/shared/types/data-grid"
// import { formatDate, formatDateTime } from '@/shared/lib/date-utils'
import { BlockedIpDto } from "@/shared/api/types.gen"
// import { zSearchBlockedIpRequest } from '@/shared/api/zod.gen'

export class BlockedIpDataGridEntry implements DataGridRowEntry {
  constructor(private blockedIp: BlockedIpDto) {}

  getId(): string {
    return this.blockedIp.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    // const schemaShape = zBlockedIp._def.shape()
    // const zodType = schemaShape[columnKey]
    // const value = this.blockedIp[columnKey]
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
    return this.blockedIp[columnKey as keyof BlockedIpDto]?.toString() || ""
  }
}
