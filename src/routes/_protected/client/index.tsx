import { createFileRoute } from "@tanstack/react-router"
import { ClientsListPage } from "@/features/client/pages/ClientsListPage"

export const Route = createFileRoute("/_protected/client/")({
  component: ClientsListPage,
})
