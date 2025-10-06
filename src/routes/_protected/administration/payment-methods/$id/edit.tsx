import { createFileRoute } from "@tanstack/react-router"
import { EditPaymentMethodPage } from "@/features/payment-methods/pages/EditPaymentMethodPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/administration/payment-methods/$id/edit")({
  beforeLoad: createPermissionGuard("PAYMENTMETHOD_UPDATE"),
  pendingComponent: PageLoader,
  component: EditPaymentMethodPage,
})
