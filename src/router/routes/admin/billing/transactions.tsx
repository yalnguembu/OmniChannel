import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import TransactionsPage from "@/pages/admin/billing/TransactionsPage";

export const Route = createFileRoute("/admin/billing/transactions")({
  component: TransactionsPage,
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.WALLETTRANSACTION_READ,
      redirectTo: "/forbidden",
    });
  },
});
