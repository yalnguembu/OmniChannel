import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import PaymentsPage from "@/pages/admin/billing/PaymentsPage";

export const Route = createFileRoute("/admin/billing/payments")({
  component: PaymentsPage,
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.PAYMENT_READ,
      redirectTo: "/forbidden",
    });
  },
});
