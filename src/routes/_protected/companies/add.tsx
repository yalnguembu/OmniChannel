import { createFileRoute } from "@tanstack/react-router"
import { CreateCompanyPage } from "@/features/companies/pages/CreateCompanyPage"

export const Route = createFileRoute("/_protected/companies/add")({
  component: CreateCompanyPage,
})
