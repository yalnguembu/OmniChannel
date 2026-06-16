import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import { SchemaTab } from "@/components/features/products/SchemaTab";

export const Route = createFileRoute("/_portal/$productId/schema")({
  component: () => (
    <div className="p-7">
      <SchemaTab productId={Route.useParams().productId} />
    </div>
  ),
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.PRODUCT_READ,
      redirectTo: "/forbidden",
    });
  },
});
