import { createFileRoute } from "@tanstack/react-router"
import { TagsListPage } from "@/features/tag/pages/TagsListPage"

export const Route = createFileRoute("/_protected/tag/")({
  component: TagsListPage,
})
