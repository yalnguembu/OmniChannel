import { createFileRoute } from "@tanstack/react-router"
import { CreateApplicationPage } from "@/features/companies/pages/CreateApplicationPage"

export const Route = createFileRoute("/_protected/applications/add")({
  component: CreateApplicationPage,
})
