import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import { WaReaboPage } from "@/pages/wareabo/WaReaboPage";
import { parseWhatsappSearch } from "@/pages/whatsapp/whatsappSearchParams";

/**
 * The WhatsApp inbox with the ReaboCanal layer — the same conversations as
 * `/wa`, plus everything réabonnement. Kept on its own route so the plain inbox
 * is unaffected, and so the Reabo work can be lifted out later without
 * untangling it from the chat.
 */
export const Route = createFileRoute("/wareabo/$senderId")({
  component: () => <WaReaboPage senderId={Route.useParams().senderId} />,
  // Same URL contract as `/wa`: the open conversation and the sidebar filters
  // live in the URL, so a reload or a shared link lands on the same view.
  validateSearch: parseWhatsappSearch,
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.WHATSAPP_READ,
      redirectTo: "/forbidden",
    });
  },
});
