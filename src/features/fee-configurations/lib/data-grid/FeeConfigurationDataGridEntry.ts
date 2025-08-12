import { DataGridRowEntry } from "@/shared/types/data-grid"
// import { formatDate, formatDateTime } from '@/shared/lib/date-utils'
import { FeeConfigurationDto } from "@/shared/api/types.gen"
// import { zSearchFeeConfigurationRequest } from '@/shared/api/zod.gen'

export class FeeConfigurationDataGridEntry implements DataGridRowEntry {
  constructor(private feeConfiguration: FeeConfigurationDto) {}

  getId(): string {
    return this.feeConfiguration.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    // const schemaShape = zFeeConfiguration._def.shape()
    // const zodType = schemaShape[columnKey]
    // const value = this.feeConfiguration[columnKey]
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
    return this.feeConfiguration[columnKey as keyof FeeConfigurationDto]?.toString() || ""
  }
}
