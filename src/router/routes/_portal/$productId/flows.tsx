import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import { FlowsTab } from "@/components/features/products/FlowsTab";

export const Route = createFileRoute("/_portal/$productId/flows")({
  component: () => (
    <div className="p-7">
      <FlowsTab productId={Route.useParams().productId} />
    </div>
  ),
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.PRODUCT_READ,
      redirectTo: "/forbidden",
    });
  },
});
