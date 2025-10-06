import { createFileRoute } from "@tanstack/react-router"
import { CreatePaymentMethodPage } from "@/features/payment-methods/pages/CreatePaymentMethodPage"
import { createPermissionGuard } from "@/shared/guards/permissionGuard"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/administration/payment-methods/add")({
  beforeLoad: createPermissionGuard("PAYMENTMETHOD_CREATE"),
  pendingComponent: PageLoader,
  component: CreatePaymentMethodPage,
})
