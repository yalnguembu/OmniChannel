import { createFileRoute } from "@tanstack/react-router"
import { CreateFeeConfigurationPage } from "@/features/fee-configurations/pages/CreateFeeConfigurationPage"

export const Route = createFileRoute("/_protected/administration/fee-configurations/add")({
  component: CreateFeeConfigurationPage,
})
