import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy product-detail URL — product sections now live at /$productId/<section>.
// Always land on the overview.
export const Route = createFileRoute("/_portal/products/$productId")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/$productId/overview",
      params: { productId: params.productId },
    });
  },
});
