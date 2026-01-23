import { createFileRoute } from "@tanstack/react-router"
import { EditCompanyPage } from "@/features/company/pages/EditCompanyPage"

export const Route = createFileRoute("/_protected/company/$id/edit")({
  component: EditCompanyPage,
})
