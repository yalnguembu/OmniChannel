import { DataGridRowEntry } from "@/shared/types/data-grid"
// import { formatDate, formatDateTime } from '@/shared/lib/date-utils'
import { UserDeviceDto } from "@/shared/api/types.gen"
// import { zSearchUserDeviceRequest } from '@/shared/api/zod.gen'

export class UserDeviceDataGridEntry implements DataGridRowEntry {
  constructor(private userDevice: UserDeviceDto) {}

  getId(): string {
    return this.userDevice.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    // const schemaShape = zUserDevice._def.shape()
    // const zodType = schemaShape[columnKey]
    // const value = this.userDevice[columnKey]
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
    return this.userDevice[columnKey as keyof UserDeviceDto]?.toString() || ""
  }
}
