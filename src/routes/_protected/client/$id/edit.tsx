import { createFileRoute } from "@tanstack/react-router"
import { EditClientPage } from "@/features/client/pages/EditClientPage"

export const Route = createFileRoute("/_protected/client/$id/edit")({
  component: EditClientPage,
})
