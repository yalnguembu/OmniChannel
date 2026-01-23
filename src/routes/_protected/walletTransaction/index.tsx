import { createFileRoute } from "@tanstack/react-router"
import { WalletTransactionsListPage } from "@/features/walletTransaction/pages/WalletTransactionsListPage"

export const Route = createFileRoute("/_protected/walletTransaction/")({
  component: WalletTransactionsListPage,
})
