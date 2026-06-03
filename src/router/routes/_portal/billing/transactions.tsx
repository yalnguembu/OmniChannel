import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import { BillingTransactionsPage } from "@/pages/_portal/billing/BillingTransactionsPage";

export const Route = createFileRoute("/_portal/billing/transactions")({
  component: BillingTransactionsPage,
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.WALLETTRANSACTION_READ,
      redirectTo: "/forbidden",
    });
  },
});
