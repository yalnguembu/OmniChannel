import { createFileRoute } from "@tanstack/react-router"
import { CreateClientImportPage } from "@/features/clientImport/pages/CreateClientImportPage"

export const Route = createFileRoute("/_protected/clientImport/add")({
  component: CreateClientImportPage,
})
