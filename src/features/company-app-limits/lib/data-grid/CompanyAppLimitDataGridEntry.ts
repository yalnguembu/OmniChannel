import { DataGridRowEntry } from "@/shared/types/data-grid"
// import { formatDate, formatDateTime } from '@/shared/lib/date-utils'
import { CompanyAppLimitDto } from "@/shared/api/types.gen"
// import { zSearchCompanyAppLimitRequest } from '@/shared/api/zod.gen'

export class CompanyAppLimitDataGridEntry implements DataGridRowEntry {
  constructor(private companyAppLimit: CompanyAppLimitDto) {}

  getId(): string {
    return this.companyAppLimit.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    // const schemaShape = zCompanyAppLimit._def.shape()
    // const zodType = schemaShape[columnKey]
    // const value = this.companyAppLimit[columnKey]
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
    return this.companyAppLimit[columnKey as keyof CompanyAppLimitDto]?.toString() || ""
  }
}
