import { createFileRoute } from "@tanstack/react-router"
import { ClientImportDetailsPage } from "@/features/clientImport/pages/ClientImportDetailsPage"

export const Route = createFileRoute("/_protected/clientImport/$id/")({
  component: ClientImportDetailsPage,
})
