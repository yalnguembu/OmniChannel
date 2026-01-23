import { createFileRoute } from "@tanstack/react-router"
import { FilesListPage } from "@/features/file/pages/FilesListPage"

export const Route = createFileRoute("/_protected/file/")({
  component: FilesListPage,
})
