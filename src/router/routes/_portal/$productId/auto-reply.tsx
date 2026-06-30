import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import { SenderReplyConfigTab } from "@/components/features/products/SenderReplyConfigTab";

export const Route = createFileRoute("/_portal/$productId/auto-reply")({
  component: () => (
    <div className="p-7">
      <SenderReplyConfigTab productId={Route.useParams().productId} />
    </div>
  ),
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.PRODUCT_READ,
      redirectTo: "/forbidden",
    });
  },
});
