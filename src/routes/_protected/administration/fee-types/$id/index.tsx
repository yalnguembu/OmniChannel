import { createFileRoute } from "@tanstack/react-router"
import { FeeTypeDetailsPage } from "@/features/fee-types/pages/FeeTypeDetailsPage"

export const Route = createFileRoute("/_protected/administration/fee-types/$id/")({
  component: FeeTypeDetailsPage,
})
