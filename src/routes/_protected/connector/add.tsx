import { createFileRoute } from "@tanstack/react-router"
import { CreateConnectorPage } from "@/features/connector/pages/CreateConnectorPage"

export const Route = createFileRoute("/_protected/connector/add")({
  component: CreateConnectorPage,
})
