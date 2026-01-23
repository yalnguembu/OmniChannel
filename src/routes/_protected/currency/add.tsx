import { createFileRoute } from "@tanstack/react-router"
import { CreateCurrencyPage } from "@/features/currency/pages/CreateCurrencyPage"

export const Route = createFileRoute("/_protected/currency/add")({
  component: CreateCurrencyPage,
})
