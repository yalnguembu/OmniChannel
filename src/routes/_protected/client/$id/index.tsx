import { createFileRoute } from "@tanstack/react-router"
import { ClientDetailsPage } from "@/features/client/pages/ClientDetailsPage"

export const Route = createFileRoute("/_protected/client/$id/")({
  component: ClientDetailsPage,
})
