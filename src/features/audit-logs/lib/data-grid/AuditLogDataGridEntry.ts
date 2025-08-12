import { DataGridRowEntry } from "@/shared/types/data-grid"
// import { formatDate, formatDateTime } from '@/shared/lib/date-utils'
import { AuditLogDto } from "@/shared/api/types.gen"
// import { zSearchAuditLogRequest } from '@/shared/api/zod.gen'

export class AuditLogDataGridEntry implements DataGridRowEntry {
  constructor(private auditLog: AuditLogDto) {}

  getId(): string {
    return this.auditLog.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    // const schemaShape = zAuditLog._def.shape()
    // const zodType = schemaShape[columnKey]
    // const value = this.auditLog[columnKey]
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
    return this.auditLog[columnKey as keyof AuditLogDto]?.toString() || ""
  }
}
