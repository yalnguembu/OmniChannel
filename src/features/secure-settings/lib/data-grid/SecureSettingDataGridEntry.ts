import { DataGridRowEntry } from "@/shared/types/data-grid"
import { SearchSecureSettingResponse } from "@/shared/api/types.gen"

export class SecureSettingDataGridEntry implements DataGridRowEntry {
  constructor(private secureSetting: SearchSecureSettingResponse) {}

  getId(): string {
    return this.secureSetting.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    return this.secureSetting[columnKey as keyof SearchSecureSettingResponse]?.toString() || ""
  }
}
