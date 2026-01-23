import { createFileRoute } from "@tanstack/react-router"
import { IntegrationSyncLogsListPage } from "@/features/integrationSyncLog/pages/IntegrationSyncLogsListPage"

export const Route = createFileRoute("/_protected/integrationSyncLog/")({
  component: IntegrationSyncLogsListPage,
})
