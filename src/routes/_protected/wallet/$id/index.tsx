import { createFileRoute } from "@tanstack/react-router"
import { WalletDetailsPage } from "@/features/wallet/pages/WalletDetailsPage"

export const Route = createFileRoute("/_protected/wallet/$id/")({
  component: WalletDetailsPage,
})
