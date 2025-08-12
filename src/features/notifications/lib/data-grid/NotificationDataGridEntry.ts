import { DataGridRowEntry } from "@/shared/types/data-grid"
// import { formatDate, formatDateTime } from '@/shared/lib/date-utils'
import { NotificationDto } from "@/shared/api/types.gen"
// import { zSearchNotificationRequest } from '@/shared/api/zod.gen'

export class NotificationDataGridEntry implements DataGridRowEntry {
  constructor(private notification: NotificationDto) {}

  getId(): string {
    return this.notification.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    // const schemaShape = zNotification._def.shape()
    // const zodType = schemaShape[columnKey]
    // const value = this.notification[columnKey]
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
    return this.notification[columnKey as keyof NotificationDto]?.toString() || ""
  }
}
