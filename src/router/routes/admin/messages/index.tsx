import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import MessagesPage from "@/pages/admin/messages/MessagesPage";

export const Route = createFileRoute("/admin/messages/")({
  component: MessagesPage,
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.MESSAGE_READ,
      redirectTo: "/forbidden",
    });
  },
});
