import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import ProductOverviewPage from "@/pages/_portal/products/ProductOverviewPage";

export const Route = createFileRoute("/_portal/$productId/overview")({
  component: () => (
    <ProductOverviewPage productId={Route.useParams().productId} />
  ),
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.PRODUCT_READ,
      redirectTo: "/forbidden",
    });
  },
});
