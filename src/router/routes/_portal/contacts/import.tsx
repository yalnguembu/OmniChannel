import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import { ContactImportPage } from "@/pages/_portal/contacts/ContactImportPage";

export const Route = createFileRoute("/_portal/contacts/import")({
  component: ContactImportPage,
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.CLIENTIMPORT_WRITE,
      redirectTo: "/forbidden",
    });
  },
});
