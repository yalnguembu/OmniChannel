import { createFileRoute } from "@tanstack/react-router"
import { JobDetailsPage } from "@/features/job/pages/JobDetailsPage"

export const Route = createFileRoute("/_protected/job/$id/")({
  component: JobDetailsPage,
})
