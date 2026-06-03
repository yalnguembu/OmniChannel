import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import { SettingsCompanyPage } from "@/pages/_portal/settings/SettingsCompanyPage";

export const Route = createFileRoute("/_portal/settings/company")({
  component: SettingsCompanyPage,
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.COMPANY_WRITE,
      redirectTo: "/forbidden",
    });
  },
});
