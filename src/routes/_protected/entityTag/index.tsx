import { createFileRoute } from "@tanstack/react-router"
import { EntityTagsListPage } from "@/features/entityTag/pages/EntityTagsListPage"

export const Route = createFileRoute("/_protected/entityTag/")({
  component: EntityTagsListPage,
})
