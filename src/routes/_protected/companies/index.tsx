import { createFileRoute } from "@tanstack/react-router"
import { CompanysListPage } from "@/features/companies/pages/CompaniesListPage"

export const Route = createFileRoute("/_protected/companies/")({
  component: CompanysListPage,
})
