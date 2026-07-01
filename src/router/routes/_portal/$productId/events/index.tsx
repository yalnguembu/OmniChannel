import { createFileRoute } from "@tanstack/react-router";
import { EventsTab } from "@/components/features/products/EventsTab";

export const Route = createFileRoute("/_portal/$productId/events/")({
  component: () => (
    <div className="p-7">
      <EventsTab productId={Route.useParams().productId} />
    </div>
  ),
});
