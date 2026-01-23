import { createFileRoute } from "@tanstack/react-router"
import { CreateJobPage } from "@/features/job/pages/CreateJobPage"

export const Route = createFileRoute("/_protected/job/add")({
  component: CreateJobPage,
})
