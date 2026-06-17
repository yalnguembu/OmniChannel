import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import { WhatsAppPage } from "@/pages/whatsapp/WhatsAppPage";

export const Route = createFileRoute("/wa/$senderId")({
  component: () => <WhatsAppPage senderId={Route.useParams().senderId} />,
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.WHATSAPP_READ,
      redirectTo: "/forbidden",
    });
  },
});
