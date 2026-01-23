import { createFileRoute } from "@tanstack/react-router"
import { CreateFilePage } from "@/features/file/pages/CreateFilePage"

export const Route = createFileRoute("/_protected/file/add")({
  component: CreateFilePage,
})
