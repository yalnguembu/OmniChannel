import { createFileRoute, Link } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import { BillingSubscriptionPage } from "@/pages/_portal/billing/BillingSubscriptionPage";

export const Route = createFileRoute("/_portal/billing/subscription")({
  component: BillingSubscriptionPage,
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.SUBSCRIPTION_READ,
      redirectTo: "/forbidden",
    });
  },
});
