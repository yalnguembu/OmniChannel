import { createFileRoute } from "@tanstack/react-router"
import { FeeConfigurationsListPage } from "@/features/fee-configurations/pages/FeeConfigurationsListPage"

export const Route = createFileRoute("/_protected/administration/fee-configurations/")({
  component: FeeConfigurationsListPage,
})
