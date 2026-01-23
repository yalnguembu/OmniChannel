import { createFileRoute } from "@tanstack/react-router"
import { ProductsListPage } from "@/features/product/pages/ProductsListPage"

export const Route = createFileRoute("/_protected/product/")({
  component: ProductsListPage,
})
