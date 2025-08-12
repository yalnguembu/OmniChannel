import { createFileRoute } from "@tanstack/react-router"
import { EditFeeConfigurationPage } from "@/features/fee-configurations/pages/EditFeeConfigurationPage"

export const Route = createFileRoute("/_protected/administration/fee-configurations/$id/edit")({
  component: EditFeeConfigurationPage,
})
