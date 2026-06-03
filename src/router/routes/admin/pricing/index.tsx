import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import PricingPage from "@/pages/admin/pricing/PricingPage";

export const Route = createFileRoute("/admin/pricing/")({
  component: PricingPage,
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.PRICING_READ,
      redirectTo: "/forbidden",
    });
  },
});
