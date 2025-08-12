import { createFileRoute } from "@tanstack/react-router"
import { EditApplicationPage } from "@/features/companies/pages/EditApplicationPage"

export const Route = createFileRoute("/_protected/applications/$id/edit")({
  component: EditApplicationPage,
})
