import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import { WhatsAppSenderRedirect } from "@/pages/whatsapp/WhatsAppSenderRedirect";

export const Route = createFileRoute("/wa/")({
  component: WhatsAppSenderRedirect,
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.WHATSAPP_READ,
      redirectTo: "/forbidden",
    });
  },
});
