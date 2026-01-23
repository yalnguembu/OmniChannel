import { createFileRoute } from "@tanstack/react-router"
import { ConnectorsListPage } from "@/features/connector/pages/ConnectorsListPage"

export const Route = createFileRoute("/_protected/connector/")({
  component: ConnectorsListPage,
})
