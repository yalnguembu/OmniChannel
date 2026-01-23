import { createFileRoute } from "@tanstack/react-router"
import { IntegrationSyncLogDetailsPage } from "@/features/integrationSyncLog/pages/IntegrationSyncLogDetailsPage"

export const Route = createFileRoute("/_protected/integrationSyncLog/$id/")({
  component: IntegrationSyncLogDetailsPage,
})
