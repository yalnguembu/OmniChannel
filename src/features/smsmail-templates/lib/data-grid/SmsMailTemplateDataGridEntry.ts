import { DataGridRowEntry } from "@/shared/types/data-grid"
// import { formatDate, formatDateTime } from '@/shared/lib/date-utils'
import { SmsmailTemplateDto } from "@/shared/api/types.gen"
// import { zSearchSmsmailTemplateRequest } from '@/shared/api/zod.gen'

export class SmsmailTemplateDataGridEntry implements DataGridRowEntry {
  constructor(private smsmailTemplate: SmsmailTemplateDto) {}

  getId(): string {
    return this.smsmailTemplate.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    // const schemaShape = zSmsmailTemplate._def.shape()
    // const zodType = schemaShape[columnKey]
    // const value = this.smsmailTemplate[columnKey]
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
    return this.smsmailTemplate[columnKey as keyof SmsmailTemplateDto]?.toString() || ""
  }
}
