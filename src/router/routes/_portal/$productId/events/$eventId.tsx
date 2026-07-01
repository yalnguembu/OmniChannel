import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import { EventDetailPage } from "@/pages/_portal/products/EventDetailPage";

export const Route = createFileRoute("/_portal/$productId/events/$eventId")({
  component: () => {
    const { productId, eventId } = Route.useParams();
    return (
      <div className="p-7">
        <EventDetailPage productId={productId} eventId={eventId} />
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
