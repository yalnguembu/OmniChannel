import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import { SegmentsPage } from "@/pages/_portal/contacts/segments/SegmentsPage";

export const Route = createFileRoute("/_portal/$productId/contacts/segments/")({
  component: () => <SegmentsPage productId={Route.useParams().productId} />,
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.CLIENTSEGMENT_READ,
      redirectTo: "/forbidden",
    });
  },
});
