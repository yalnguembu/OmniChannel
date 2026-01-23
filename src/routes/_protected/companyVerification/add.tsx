import { createFileRoute } from "@tanstack/react-router"
import { CreateCompanyVerificationPage } from "@/features/companyVerification/pages/CreateCompanyVerificationPage"

export const Route = createFileRoute("/_protected/companyVerification/add")({
  component: CreateCompanyVerificationPage,
})
