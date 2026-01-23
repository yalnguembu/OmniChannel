import { createFileRoute } from "@tanstack/react-router"
import { EditIntegrationPage } from "@/features/integration/pages/EditIntegrationPage"

export const Route = createFileRoute("/_protected/integration/$id/edit")({
  component: EditIntegrationPage,
})
