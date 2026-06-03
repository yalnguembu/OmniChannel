import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import { SegmentsPage } from "@/pages/_portal/contacts/segments/SegmentsPage";

export const Route = createFileRoute("/_portal/contacts/segments/")({
  component: SegmentsPage,
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.CLIENTSEGMENT_READ,
      redirectTo: "/forbidden",
    });
  },
});
