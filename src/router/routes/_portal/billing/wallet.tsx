import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import { BillingWalletPage } from "@/pages/_portal/billing/BillingWalletPage";

export const Route = createFileRoute("/_portal/billing/wallet")({
  component: BillingWalletPage,
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.WALLET_READ,
      redirectTo: "/forbidden",
    });
  },
});
