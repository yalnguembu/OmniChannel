import { createFileRoute } from "@tanstack/react-router"
import { DocumentTypesListPage } from "@/features/document-types/pages/DocumentTypesListPage"

export const Route = createFileRoute("/_protected/administration/document-types")({
  component: DocumentTypesListPage,
})
