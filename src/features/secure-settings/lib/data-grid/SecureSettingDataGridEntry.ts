import { DataGridRowEntry } from "@/shared/types/data-grid"
import { SearchSecureSettingResponse } from "@/shared/api/types.gen"

import { formatDate } from "@/shared/lib/date"

export class SecureSettingDataGridEntry implements DataGridRowEntry {
  constructor(private secureSetting: SearchSecureSettingResponse) {}

  getId(): string {
    return this.secureSetting.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    if (columnKey === "createdAt") {
      return formatDate(this.secureSetting[columnKey as keyof SearchSecureSettingResponse]?.toString() || "")
    }
    return this.secureSetting[columnKey as keyof SearchSecureSettingResponse]?.toString() || ""
  }
}
