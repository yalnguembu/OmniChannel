import { DataGridRowEntry } from "@/shared/types/data-grid"
// import { formatDate, formatDateTime } from '@/shared/lib/date-utils'
import { UserDto } from "@/shared/api/types.gen"
// import { zSearchUserRequest } from '@/shared/api/zod.gen'

export class UserDataGridEntry implements DataGridRowEntry {
  constructor(private user: UserDto) {}

  getId(): string {
    return this.user.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    // const schemaShape = zUser._def.shape()
    // const zodType = schemaShape[columnKey]
    // const value = this.user[columnKey]
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
    return this.user[columnKey as keyof UserDto]?.toString() || ""
  }
}
