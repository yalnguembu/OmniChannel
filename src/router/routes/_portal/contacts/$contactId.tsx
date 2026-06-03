import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import { ContactDetailPage } from "@/pages/_portal/contacts/ContactDetailPage";

export const Route = createFileRoute("/_portal/contacts/$contactId")({
  component: () => (
    <ContactDetailPage contactId={Route.useSearch().contactId} />
  ),
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.CLIENT_READ,
      redirectTo: "/forbidden",
    });
  },
});
