import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import { FunnelsTab } from "@/components/features/products/FunnelsTab";

export const Route = createFileRoute("/_portal/$productId/funnels")({
  component: () => (
    <div className="p-7">
      <FunnelsTab productId={Route.useParams().productId} />
    </div>
  ),
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.PRODUCT_READ,
      redirectTo: "/forbidden",
    });
  },
});
