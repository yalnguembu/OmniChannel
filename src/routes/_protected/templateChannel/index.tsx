import { createFileRoute } from "@tanstack/react-router"
import { TemplateChannelsListPage } from "@/features/templateChannel/pages/TemplateChannelsListPage"

export const Route = createFileRoute("/_protected/templateChannel/")({
  component: TemplateChannelsListPage,
})
