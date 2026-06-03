import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import ProductsPage from "@/pages/_portal/products/ProductsPage";

export const Route = createFileRoute("/_portal/products/")({
  component: ProductsPage,
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.PRODUCT_READ,
      redirectTo: "/forbidden",
    });
  },
});
