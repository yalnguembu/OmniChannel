import { createFileRoute } from "@tanstack/react-router"
import { CreateCompanyAppLimitPage } from "@/features/company-app-limits/pages/CreateCompanyAppLimitPage"

export const Route = createFileRoute("/_protected/administration/company-app-limits/add")({
  component: CreateCompanyAppLimitPage,
})
