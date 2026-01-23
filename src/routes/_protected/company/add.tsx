import { createFileRoute } from "@tanstack/react-router"
import { CreateCompanyPage } from "@/features/company/pages/CreateCompanyPage"

export const Route = createFileRoute("/_protected/company/add")({
  component: CreateCompanyPage,
})
