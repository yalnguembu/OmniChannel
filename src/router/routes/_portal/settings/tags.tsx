import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import { TagsPage } from "@/pages/_portal/settings/TagsPage";

export const Route = createFileRoute("/_portal/settings/tags")({
  component: TagsPage,
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.TAG_WRITE,
      redirectTo: "/forbidden",
    });
  },
});
