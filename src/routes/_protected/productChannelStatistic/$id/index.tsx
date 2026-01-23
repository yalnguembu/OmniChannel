import { createFileRoute } from "@tanstack/react-router"
import { ProductChannelStatisticDetailsPage } from "@/features/productChannelStatistic/pages/ProductChannelStatisticDetailsPage"

export const Route = createFileRoute("/_protected/productChannelStatistic/$id/")({
  component: ProductChannelStatisticDetailsPage,
})
