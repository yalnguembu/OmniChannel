import { createFileRoute } from "@tanstack/react-router"
import { ClientImportsListPage } from "@/features/clientImport/pages/ClientImportsListPage"

export const Route = createFileRoute("/_protected/clientImport/")({
  component: ClientImportsListPage,
})
