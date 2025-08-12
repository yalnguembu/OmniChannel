import { DataGridRowEntry } from "@/shared/types/data-grid"
// import { formatDate, formatDateTime } from '@/shared/lib/date-utils'
import { CountryDto } from "@/shared/api/types.gen"
// import { zSearchCountryRequest } from '@/shared/api/zod.gen'

export class CountryDataGridEntry implements DataGridRowEntry {
  constructor(private country: CountryDto) {}

  getId(): string {
    return this.country.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    // const schemaShape = zCountry._def.shape()
    // const zodType = schemaShape[columnKey]
    // const value = this.country[columnKey]
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
    return this.country[columnKey as keyof CountryDto]?.toString() || ""
  }
}
