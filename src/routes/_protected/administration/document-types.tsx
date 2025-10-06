import { createFileRoute } from "@tanstack/react-router"
import { DocumentTypesListPage } from "@/features/document-types/pages/DocumentTypesListPage"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/administration/document-types")({
  pendingComponent: PageLoader,
  component: DocumentTypesListPage,
})
