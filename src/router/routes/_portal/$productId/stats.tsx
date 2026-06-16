import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import { StatsTab } from "@/components/features/products/detail/StatsTab";

export const Route = createFileRoute("/_portal/$productId/stats")({
  component: () => (
    <div className="p-7">
      <StatsTab />
    </div>
  ),
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.PRODUCT_READ,
      redirectTo: "/forbidden",
    });
  },
});
