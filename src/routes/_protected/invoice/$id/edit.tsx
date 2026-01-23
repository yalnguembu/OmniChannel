import { createFileRoute } from "@tanstack/react-router"
import { EditInvoicePage } from "@/features/invoice/pages/EditInvoicePage"

export const Route = createFileRoute("/_protected/invoice/$id/edit")({
  component: EditInvoicePage,
})
