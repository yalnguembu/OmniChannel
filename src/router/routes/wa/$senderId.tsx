import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import { WhatsAppPage } from "@/pages/whatsapp/WhatsAppPage";
import { parseWhatsappSearch } from "@/pages/whatsapp/whatsappSearchParams";

export const Route = createFileRoute("/wa/$senderId")({
  component: () => <WhatsAppPage senderId={Route.useParams().senderId} />,
  // The open conversation and the sidebar filters live in the URL so a reload
  // (or a link shared with a colleague) lands back on the same view.
  validateSearch: parseWhatsappSearch,
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.WHATSAPP_READ,
      redirectTo: "/forbidden",
    });
  },
});
