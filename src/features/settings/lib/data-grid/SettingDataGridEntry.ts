import { DataGridRowEntry } from "@/shared/types/data-grid"
import { formatDate } from "@/shared/lib/date"

import { SettingDto } from "@/shared/api/types.gen"

export class SettingDataGridEntry implements DataGridRowEntry {
  constructor(private setting: SettingDto) {}

  getId(): string {
    return this.setting.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    if (columnKey === "createdAt") {
      return formatDate(this.setting[columnKey as keyof SettingDto]?.toString() || "")
    }
    return this.setting[columnKey as keyof SettingDto]?.toString() || ""
  }
}
