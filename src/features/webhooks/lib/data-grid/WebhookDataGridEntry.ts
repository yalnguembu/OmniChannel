import { DataGridRowEntry } from "@/shared/types/data-grid"
// import { formatDate, formatDateTime } from '@/shared/lib/date-utils'
import { WebhookDto } from "@/shared/api/types.gen"
// import { zSearchWebhookRequest } from '@/shared/api/zod.gen'

export class WebhookDataGridEntry implements DataGridRowEntry {
  constructor(private webhook: WebhookDto) {}

  getId(): string {
    return this.webhook.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    // const schemaShape = zWebhook._def.shape()
    // const zodType = schemaShape[columnKey]
    // const value = this.webhook[columnKey]
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
    return this.webhook[columnKey as keyof WebhookDto]?.toString() || ""
  }
}
