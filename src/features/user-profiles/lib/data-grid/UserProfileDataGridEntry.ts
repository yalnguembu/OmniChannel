import { DataGridRowEntry } from "@/shared/types/data-grid"
// import { formatDate, formatDateTime } from '@/shared/lib/date-utils'
import { UserProfileDto } from "@/shared/api/types.gen"
// import { zSearchUserProfileRequest } from '@/shared/api/zod.gen'

export class UserProfileDataGridEntry implements DataGridRowEntry {
  constructor(private userProfile: UserProfileDto) {}

  getId(): string {
    return this.userProfile.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    // const schemaShape = zUserProfile._def.shape()
    // const zodType = schemaShape[columnKey]
    // const value = this.userProfile[columnKey]
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
    return this.userProfile[columnKey as keyof UserProfileDto]?.toString() || ""
  }
}
