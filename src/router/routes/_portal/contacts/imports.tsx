import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import { ImportHistoryPage } from "@/pages/_portal/contacts/ImportHistoryPage";

export const Route = createFileRoute("/_portal/contacts/imports")({
  component: ImportHistoryPage,
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.CLIENTIMPORT_READ,
      redirectTo: "/forbidden",
    });
  },
});
