import { createFileRoute } from "@tanstack/react-router"
import { CompanyVerificationDetailsPage } from "@/features/companyVerification/pages/CompanyVerificationDetailsPage"

export const Route = createFileRoute("/_protected/companyVerification/$id/")({
  component: CompanyVerificationDetailsPage,
})
