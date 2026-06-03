import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import MessagesPage from "@/pages/_portal/messages/MessagesPage";

export const Route = createFileRoute("/_portal/messages/")({
  component: MessagesPage,
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.MESSAGE_READ,
      redirectTo: "/forbidden",
    });
  },
});
