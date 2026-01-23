import { createFileRoute } from "@tanstack/react-router"
import { CompanyDetailsPage } from "@/features/company/pages/CompanyDetailsPage"

export const Route = createFileRoute("/_protected/company/$id/")({
  component: CompanyDetailsPage,
})
