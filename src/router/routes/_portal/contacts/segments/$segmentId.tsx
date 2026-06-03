import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import { SegmentDetailPage } from "@/pages/_portal/contacts/segments/SegmentDetailPage";

export const Route = createFileRoute("/_portal/contacts/segments/$segmentId")({
  component: () => (
    <SegmentDetailPage segmentId={Route.useParams().segmentId} />
  ),
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.CLIENTSEGMENT_READ,
      redirectTo: "/forbidden",
    });
  },
});
