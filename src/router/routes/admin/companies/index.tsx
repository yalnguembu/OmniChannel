import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import CompaniesPage from "@/pages/admin/companies/CompaniesPage";

export const Route = createFileRoute("/admin/companies/")({
  component: CompaniesPage,
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.COMPANY_READ,
      redirectTo: "/forbidden",
    });
  },
});
