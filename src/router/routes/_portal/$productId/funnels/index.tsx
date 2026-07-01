import { createFileRoute } from "@tanstack/react-router";
import { FunnelsTab } from "@/components/features/products/FunnelsTab";

export const Route = createFileRoute("/_portal/$productId/funnels/")({
  component: () => (
    <div className="p-7">
      <FunnelsTab productId={Route.useParams().productId} />
    </div>
  ),
});
