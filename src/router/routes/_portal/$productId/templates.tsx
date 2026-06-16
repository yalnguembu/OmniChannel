import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import { TemplatesPage } from "@/pages/_portal/templates/TemplatesPage";

export const Route = createFileRoute("/_portal/$productId/templates")({
  component: () => <TemplatesPage productId={Route.useParams().productId} />,
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.TEMPLATE_READ,
      redirectTo: "/forbidden",
    });
  },
});
