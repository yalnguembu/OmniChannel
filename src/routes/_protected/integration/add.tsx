import { createFileRoute } from "@tanstack/react-router"
import { CreateIntegrationPage } from "@/features/integration/pages/CreateIntegrationPage"

export const Route = createFileRoute("/_protected/integration/add")({
  component: CreateIntegrationPage,
})
