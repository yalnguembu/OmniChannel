import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import { EventsTab } from "@/components/features/products/EventsTab";

export const Route = createFileRoute("/_portal/$productId/events")({
  component: () => (
    <div className="p-7">
      <EventsTab productId={Route.useParams().productId} />
    </div>
  ),
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.PRODUCT_READ,
      redirectTo: "/forbidden",
    });
  },
});
