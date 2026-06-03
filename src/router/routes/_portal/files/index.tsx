import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import { FilesPage } from "@/pages/_portal/files/FilesPage";

export const Route = createFileRoute("/_portal/files/")({
  component: FilesPage,
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.FILE_READ,
      redirectTo: "/forbidden",
    });
  },
});
