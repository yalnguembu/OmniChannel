import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import { FunnelDetailPage } from "@/pages/_portal/products/FunnelDetailPage";

export const Route = createFileRoute("/_portal/$productId/funnels/$funnelId")({
  component: () => {
    const { productId, funnelId } = Route.useParams();
    return (
      <div className="p-7">
        <FunnelDetailPage productId={productId} funnelId={funnelId} />
      </div>
    );
  },
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.PRODUCT_READ,
      redirectTo: "/forbidden",
    });
  },
});
