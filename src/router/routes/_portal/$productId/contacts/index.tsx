import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import { ContactsPage } from "@/pages/_portal/contacts/ContactsPage";

export const Route = createFileRoute("/_portal/$productId/contacts/")({
  component: () => <ContactsPage productId={Route.useParams().productId} />,
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.CLIENT_READ,
      redirectTo: "/forbidden",
    });
  },
});
