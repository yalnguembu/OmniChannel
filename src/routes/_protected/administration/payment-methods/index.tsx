import { createFileRoute } from "@tanstack/react-router"
import { PaymentMethodsListPage } from "@/features/payment-methods/pages/PaymentMethodsListPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/administration/payment-methods/")({
  beforeLoad: createPermissionGuard("PAYMENTMETHOD_VIEW"),
  pendingComponent: PageLoader,
  component: PaymentMethodsListPage,
})
