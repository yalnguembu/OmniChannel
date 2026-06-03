import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import { BillingInvoicesPage } from "@/pages/_portal/billing/BillingInvoicesPage";

export const Route = createFileRoute("/_portal/billing/invoices")({
  component: BillingInvoicesPage,
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.INVOICE_READ,
      redirectTo: "/forbidden",
    });
  },
});
