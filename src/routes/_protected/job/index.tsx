import { createFileRoute } from "@tanstack/react-router"
import { JobsListPage } from "@/features/job/pages/JobsListPage"

export const Route = createFileRoute("/_protected/job/")({
  component: JobsListPage,
})
