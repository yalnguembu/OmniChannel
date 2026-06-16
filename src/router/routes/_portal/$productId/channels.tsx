import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import { ChannelsTab } from "@/components/features/products/ChannelsTab";

export const Route = createFileRoute("/_portal/$productId/channels")({
  component: () => (
    <div className="p-7">
      <ChannelsTab productId={Route.useParams().productId} />
    </div>
  ),
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.PRODUCT_READ,
      redirectTo: "/forbidden",
    });
  },
});
