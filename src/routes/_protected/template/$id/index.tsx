import { createFileRoute } from "@tanstack/react-router"
import { TemplateDetailsPage } from "@/features/template/pages/TemplateDetailsPage"

export const Route = createFileRoute("/_protected/template/$id/")({
  component: TemplateDetailsPage,
})
