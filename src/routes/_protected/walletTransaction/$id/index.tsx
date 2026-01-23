import { createFileRoute } from "@tanstack/react-router"
import { WalletTransactionDetailsPage } from "@/features/walletTransaction/pages/WalletTransactionDetailsPage"

export const Route = createFileRoute("/_protected/walletTransaction/$id/")({
  component: WalletTransactionDetailsPage,
})
