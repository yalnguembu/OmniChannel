import { ContactsPage } from "@/pages/_portal/contacts/ContactsPage";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_portal/contacts/")({
  component: ContactsPage,
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.CLIENT_READ,
      redirectTo: "/forbidden",
    });
  },
});
