import { DataGridRowEntry } from "@/shared/types/data-grid"
// import { formatDate, formatDateTime } from '@/shared/lib/date-utils'
import { LogDto } from "@/shared/api/types.gen"
// import { zSearchLogRequest } from '@/shared/api/zod.gen'

export class LogDataGridEntry implements DataGridRowEntry {
  constructor(private log: LogDto) {}

  getId(): string {
    return this.log.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    // const schemaShape = zLog._def.shape()
    // const zodType = schemaShape[columnKey]
    // const value = this.log[columnKey]
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
    return this.log[columnKey as keyof LogDto]?.toString() || ""
  }
}
