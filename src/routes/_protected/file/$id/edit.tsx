import { createFileRoute } from "@tanstack/react-router"
import { EditFilePage } from "@/features/file/pages/EditFilePage"

export const Route = createFileRoute("/_protected/file/$id/edit")({
  component: EditFilePage,
})
