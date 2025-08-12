import { DataGridRowEntry } from "@/shared/types/data-grid"
// import { formatDate, formatDateTime } from '@/shared/lib/date-utils'
import { ApplicationDto } from "@/shared/api/types.gen"
// import { zSearchApplicationRequest } from '@/shared/api/zod.gen'

export class ApplicationDataGridEntry implements DataGridRowEntry {
  constructor(private application: ApplicationDto) {}

  getId(): string {
    return this.application.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    // const schemaShape = zApplication._def.shape()
    // const zodType = schemaShape[columnKey]
    // const value = this.application[columnKey]
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
    return this.application[columnKey as keyof ApplicationDto]?.toString() || ""
  }
}
