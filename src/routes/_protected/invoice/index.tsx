import { createFileRoute } from "@tanstack/react-router"
import { InvoicesListPage } from "@/features/invoice/pages/InvoicesListPage"

export const Route = createFileRoute("/_protected/invoice/")({
  component: InvoicesListPage,
})
