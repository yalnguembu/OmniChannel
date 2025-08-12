import { createFileRoute } from "@tanstack/react-router"
import { CompanyAppLimitsListPage } from "@/features/company-app-limits/pages/CompanyAppLimitsListPage"

export const Route = createFileRoute("/_protected/administration/company-app-limits/")({
  component: CompanyAppLimitsListPage,
})
