import { createFileRoute } from "@tanstack/react-router"
import { FileDetailsPage } from "@/features/file/pages/FileDetailsPage"

export const Route = createFileRoute("/_protected/file/$id/")({
  component: FileDetailsPage,
})
