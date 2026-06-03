import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import InvoicesPage from "@/pages/admin/billing/InvoicesPage";

export const Route = createFileRoute("/admin/billing/invoices")({
  component: InvoicesPage,
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.INVOICE_READ,
      redirectTo: "/forbidden",
    });
  },
});
