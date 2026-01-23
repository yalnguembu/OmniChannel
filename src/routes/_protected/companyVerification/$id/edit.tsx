import { createFileRoute } from "@tanstack/react-router"
import { EditCompanyVerificationPage } from "@/features/companyVerification/pages/EditCompanyVerificationPage"

export const Route = createFileRoute("/_protected/companyVerification/$id/edit")({
  component: EditCompanyVerificationPage,
})
