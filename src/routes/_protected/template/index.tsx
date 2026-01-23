import { createFileRoute } from "@tanstack/react-router"
import { TemplatesListPage } from "@/features/template/pages/TemplatesListPage"

export const Route = createFileRoute("/_protected/template/")({
  component: TemplatesListPage,
})
