import { createFileRoute } from "@tanstack/react-router"
import { CompanyVerificationsListPage } from "@/features/companyVerification/pages/CompanyVerificationsListPage"

export const Route = createFileRoute("/_protected/companyVerification/")({
  component: CompanyVerificationsListPage,
})
