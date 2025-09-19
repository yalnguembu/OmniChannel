import { DataGridRowEntry } from "@/shared/types/data-grid"
import { formatDate } from "@/shared/lib/date"
import { PaymentMethodDto } from "@/shared/api/types.gen"

export class PaymentMethodDataGridEntry implements DataGridRowEntry {
  constructor(private paymentMethod: PaymentMethodDto) {}

  getId(): string {
    return this.paymentMethod.id?.toString() || ""
  }

  getTextFor(columnKey: string): string {
    if (columnKey === "createdAt") {
      return formatDate(this.paymentMethod[columnKey as keyof PaymentMethodDto]?.toString() || "")
    }
    return this.paymentMethod[columnKey as keyof PaymentMethodDto]?.toString() || ""
  }
}
