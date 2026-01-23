import { createFileRoute } from "@tanstack/react-router"
import { ConnectorDetailsPage } from "@/features/connector/pages/ConnectorDetailsPage"

export const Route = createFileRoute("/_protected/connector/$id/")({
  component: ConnectorDetailsPage,
})
