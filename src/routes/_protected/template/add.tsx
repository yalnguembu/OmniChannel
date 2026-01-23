import { createFileRoute } from "@tanstack/react-router"
import { CreateTemplatePage } from "@/features/template/pages/CreateTemplatePage"

export const Route = createFileRoute("/_protected/template/add")({
  component: CreateTemplatePage,
})
