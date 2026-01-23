import { createFileRoute } from "@tanstack/react-router"
import { EditJobPage } from "@/features/job/pages/EditJobPage"

export const Route = createFileRoute("/_protected/job/$id/edit")({
  component: EditJobPage,
})
