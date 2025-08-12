import { createFileRoute } from "@tanstack/react-router"
import { EditCompanyPage } from "@/features/companies/pages/EditCompanyPage"

export const Route = createFileRoute("/_protected/companies/$id/edit")({
  component: EditCompanyPage,
})
