import { createFileRoute } from "@tanstack/react-router"
import { EditTemplatePage } from "@/features/template/pages/EditTemplatePage"

export const Route = createFileRoute("/_protected/template/$id/edit")({
  component: EditTemplatePage,
})
