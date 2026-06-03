import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import ProductDetailPage from "@/pages/_portal/products/ProductDetailPage";

export const Route = createFileRoute("/_portal/products/$productId")({
  component: () => (
    <ProductDetailPage productId={Route.useParams().productId} />
  ),
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.PRODUCT_READ,
      redirectTo: "/forbidden",
    });
  },
});
