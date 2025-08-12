import { DataGridRowEntry } from "@/shared/types/data-grid"
// import { formatDate, formatDateTime } from '@/shared/lib/date-utils'

export type Entity = { id: string } & Record<string, any>
export class CommonDataGridEntry<T extends Entity> implements DataGridRowEntry {
  constructor(private user: T) {}

  getId(): string {
    return (this.user.id as unknown as string)?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    return this.user[columnKey as keyof T]?.toString() || ""
  }
}
