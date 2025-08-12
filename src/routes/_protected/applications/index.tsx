import { createFileRoute } from "@tanstack/react-router"
import { ApplicationsListPage } from "@/features/companies/pages/ApplicationsListPage"

export const Route = createFileRoute("/_protected/applications/")({
  component: ApplicationsListPage,
})
