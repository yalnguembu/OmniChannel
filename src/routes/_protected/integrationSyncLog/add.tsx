import { createFileRoute } from "@tanstack/react-router"
import { CreateIntegrationSyncLogPage } from "@/features/integrationSyncLog/pages/CreateIntegrationSyncLogPage"

export const Route = createFileRoute("/_protected/integrationSyncLog/add")({
  component: CreateIntegrationSyncLogPage,
})
