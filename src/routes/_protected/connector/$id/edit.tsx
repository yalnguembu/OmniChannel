import { createFileRoute } from "@tanstack/react-router"
import { EditConnectorPage } from "@/features/connector/pages/EditConnectorPage"

export const Route = createFileRoute("/_protected/connector/$id/edit")({
  component: EditConnectorPage,
})
