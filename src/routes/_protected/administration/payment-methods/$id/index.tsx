import { createFileRoute } from "@tanstack/react-router"
import { PaymentMethodDetailsPage } from "@/features/payment-methods/pages/PaymentMethodDetailsPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/administration/payment-methods/$id/")({
  beforeLoad: createPermissionGuard("PAYMENTMETHOD_VIEW"),
  pendingComponent: PageLoader,
  component: PaymentMethodDetailsPage,
})
