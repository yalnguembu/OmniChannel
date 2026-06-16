import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import { ConnectorsTab } from "@/components/features/products/ConnectorsTab";

export const Route = createFileRoute("/_portal/$productId/connectors")({
  component: () => (
    <div className="p-7">
      <ConnectorsTab productId={Route.useParams().productId} />
    </div>
  ),
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.PRODUCT_READ,
      redirectTo: "/forbidden",
    });
  },
});
