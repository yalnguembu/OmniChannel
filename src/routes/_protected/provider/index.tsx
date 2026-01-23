import { createFileRoute } from "@tanstack/react-router"
import { ProvidersListPage } from "@/features/provider/pages/ProvidersListPage"

export const Route = createFileRoute("/_protected/provider/")({
  component: ProvidersListPage,
})
