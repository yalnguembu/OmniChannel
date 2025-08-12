import { createFileRoute } from "@tanstack/react-router"
import { CreateFeeTypePage } from "@/features/fee-types/pages/CreateFeeTypePage"

export const Route = createFileRoute("/_protected/administration/fee-types/add")({
  component: CreateFeeTypePage,
})
