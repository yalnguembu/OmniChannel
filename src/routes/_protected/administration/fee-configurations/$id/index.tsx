import { createFileRoute } from "@tanstack/react-router"
import { FeeConfigurationDetailsPage } from "@/features/fee-configurations/pages/FeeConfigurationDetailsPage"

export const Route = createFileRoute("/_protected/administration/fee-configurations/$id/")({
  component: FeeConfigurationDetailsPage,
})
