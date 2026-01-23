import { createFileRoute } from "@tanstack/react-router"
import { IntegrationDetailsPage } from "@/features/integration/pages/IntegrationDetailsPage"

export const Route = createFileRoute("/_protected/integration/$id/")({
  component: IntegrationDetailsPage,
})
