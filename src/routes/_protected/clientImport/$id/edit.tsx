import { createFileRoute } from "@tanstack/react-router"
import { EditClientImportPage } from "@/features/clientImport/pages/EditClientImportPage"

export const Route = createFileRoute("/_protected/clientImport/$id/edit")({
  component: EditClientImportPage,
})
