import { createFileRoute } from "@tanstack/react-router"
import { CreateClientPage } from "@/features/client/pages/CreateClientPage"

export const Route = createFileRoute("/_protected/client/add")({
  component: CreateClientPage,
})
