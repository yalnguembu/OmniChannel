import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import { SegmentDetailPage } from "@/pages/_portal/contacts/segments/SegmentDetailPage";

export const Route = createFileRoute(
  "/_portal/$productId/contacts/segments/$segmentId",
)({
  component: () => {
    const { productId, segmentId } = Route.useParams();
    return <SegmentDetailPage productId={productId} segmentId={segmentId} />;
  },
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.CLIENTSEGMENT_READ,
      redirectTo: "/forbidden",
    });
  },
});
