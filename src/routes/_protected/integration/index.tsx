import { createFileRoute } from "@tanstack/react-router"
import { IntegrationsListPage } from "@/features/integration/pages/IntegrationsListPage"

export const Route = createFileRoute("/_protected/integration/")({
  component: IntegrationsListPage,
})
