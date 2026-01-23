import { createFileRoute } from "@tanstack/react-router"
import { ClientChannelPreferencesListPage } from "@/features/clientChannelPreference/pages/ClientChannelPreferencesListPage"

export const Route = createFileRoute("/_protected/clientChannelPreference/")({
  component: ClientChannelPreferencesListPage,
})
