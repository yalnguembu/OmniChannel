import { createFileRoute } from "@tanstack/react-router"
import { CompanysListPage } from "@/features/company/pages/CompanysListPage"

export const Route = createFileRoute("/_protected/company/")({
  component: CompanysListPage,
})
