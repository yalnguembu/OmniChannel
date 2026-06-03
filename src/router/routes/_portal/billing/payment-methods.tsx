import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import { BillingPaymentMethodsPage } from "@/pages/_portal/billing/BillingPaymentMethodsPage";

export const Route = createFileRoute("/_portal/billing/payment-methods")({
  component: BillingPaymentMethodsPage,
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.PAYMENTMETHOD_READ,
      redirectTo: "/forbidden",
    });
  },
});
