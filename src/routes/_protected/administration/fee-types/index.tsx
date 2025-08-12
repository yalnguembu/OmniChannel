import { createFileRoute } from "@tanstack/react-router"
import { FeeTypesListPage } from "@/features/fee-types/pages/FeeTypesListPage"

export const Route = createFileRoute("/_protected/administration/fee-types/")({
  component: FeeTypesListPage,
})
