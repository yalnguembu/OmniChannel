import { createFileRoute } from "@tanstack/react-router"
import { EditCompanyAppLimitPage } from "@/features/company-app-limits/pages/EditCompanyAppLimitPage"

export const Route = createFileRoute("/_protected/administration/company-app-limits/$id/edit")({
  component: EditCompanyAppLimitPage,
})
