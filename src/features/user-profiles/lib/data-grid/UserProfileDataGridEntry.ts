import { DataGridRowEntry } from "@/shared/types/data-grid"
import { formatDate } from "@/shared/lib/date"
import { UserProfileDto } from "@/shared/api/types.gen"

export class UserProfileDataGridEntry implements DataGridRowEntry {
  constructor(private userProfile: UserProfileDto) {}

  getId(): string {
    return this.userProfile.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    if (columnKey === "createdAt") {
      return formatDate(this.userProfile[columnKey as keyof UserProfileDto]?.toString() || "")
    }
    return this.userProfile[columnKey as keyof UserProfileDto]?.toString() || ""
  }
}
