import { createFileRoute } from "@tanstack/react-router"
import { CreateInvoicePage } from "@/features/invoice/pages/CreateInvoicePage"

export const Route = createFileRoute("/_protected/invoice/add")({
  component: CreateInvoicePage,
})
