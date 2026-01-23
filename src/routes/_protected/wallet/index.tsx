import { createFileRoute } from "@tanstack/react-router"
import { WalletsListPage } from "@/features/wallet/pages/WalletsListPage"

export const Route = createFileRoute("/_protected/wallet/")({
  component: WalletsListPage,
})
