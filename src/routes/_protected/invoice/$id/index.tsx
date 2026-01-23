import { createFileRoute } from "@tanstack/react-router"
import { InvoiceDetailsPage } from "@/features/invoice/pages/InvoiceDetailsPage"

export const Route = createFileRoute("/_protected/invoice/$id/")({
  component: InvoiceDetailsPage,
})
