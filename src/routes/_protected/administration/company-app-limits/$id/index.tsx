import { createFileRoute } from "@tanstack/react-router"
import { CompanyAppLimitDetailsPage } from "@/features/company-app-limits/pages/CompanyAppLimitDetailsPage"

export const Route = createFileRoute("/_protected/administration/company-app-limits/$id/")({
  component: CompanyAppLimitDetailsPage,
})
