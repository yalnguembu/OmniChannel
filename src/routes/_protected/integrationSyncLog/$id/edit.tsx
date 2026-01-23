import { createFileRoute } from "@tanstack/react-router"
import { EditIntegrationSyncLogPage } from "@/features/integrationSyncLog/pages/EditIntegrationSyncLogPage"

export const Route = createFileRoute("/_protected/integrationSyncLog/$id/edit")({
  component: EditIntegrationSyncLogPage,
})
