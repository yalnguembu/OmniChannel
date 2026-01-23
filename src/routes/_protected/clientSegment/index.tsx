import { createFileRoute } from "@tanstack/react-router"
import { ClientSegmentsListPage } from "@/features/clientSegment/pages/ClientSegmentsListPage"

export const Route = createFileRoute("/_protected/clientSegment/")({
  component: ClientSegmentsListPage,
})
