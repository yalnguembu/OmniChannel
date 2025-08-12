import { DataGridRowEntry } from "@/shared/types/data-grid"
// import { formatDate, formatDateTime } from '@/shared/lib/date-utils'
import { FrontEventLogDto } from "@/shared/api/types.gen"
// import { zSearchFrontEventLogRequest } from '@/shared/api/zod.gen'

export class FrontEventLogDataGridEntry implements DataGridRowEntry {
  constructor(private frontEventLog: FrontEventLogDto) {}

  getId(): string {
    return this.frontEventLog.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    // const schemaShape = zFrontEventLog._def.shape()
    // const zodType = schemaShape[columnKey]
    // const value = this.frontEventLog[columnKey]
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
    return this.frontEventLog[columnKey as keyof FrontEventLogDto]?.toString() || ""
  }
}
