import { DataGridRowEntry } from "@/shared/types/data-grid"
import { formatDate } from "@/shared/lib/date"
import { UserDto } from "@/shared/api/types.gen"

export class UserDataGridEntry implements DataGridRowEntry {
  constructor(private user: UserDto) {}

  getId(): string {
    return this.user.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    if (columnKey === "createdAt") return formatDate(this.user[columnKey as keyof UserDto]?.toString() || "")
    if (columnKey === "statusTheme") return this.user.status === "ACTIVE" ? "GREEN" : "YELLOW"

    return this.user[columnKey as keyof UserDto]?.toString() || ""
  }
}
