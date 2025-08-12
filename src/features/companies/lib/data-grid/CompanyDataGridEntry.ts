import { DataGridRowEntry } from "@/shared/types/data-grid"
// import { formatDate, formatDateTime } from '@/shared/lib/date-utils'
import { CompanyDto } from "@/shared/api/types.gen"
// import { zSearchCompanyRequest } from '@/shared/api/zod.gen'

export class CompanyDataGridEntry implements DataGridRowEntry {
  constructor(private company: CompanyDto) {}

  getId(): string {
    return this.company.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    // const schemaShape = zCompany._def.shape()
    // const zodType = schemaShape[columnKey]
    // const value = this.company[columnKey]
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
    return this.company[columnKey as keyof CompanyDto]?.toString() || ""
  }
}
