import { createFileRoute } from "@tanstack/react-router"
import { EditFeeTypePage } from "@/features/fee-types/pages/EditFeeTypePage"

export const Route = createFileRoute("/_protected/administration/fee-types/$id/edit")({
  component: EditFeeTypePage,
})
