import { createFileRoute } from "@tanstack/react-router";
import { SendersPage } from "@/pages/_portal/settings/SendersPage";

export const Route = createFileRoute("/_portal/settings/senders")({
  component: SendersPage,
});
