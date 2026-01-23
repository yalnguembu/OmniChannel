import { createFileRoute } from "@tanstack/react-router"
import { ProviderCallbacksListPage } from "@/features/providerCallback/pages/ProviderCallbacksListPage"

export const Route = createFileRoute("/_protected/providerCallback/")({
  component: ProviderCallbacksListPage,
})
