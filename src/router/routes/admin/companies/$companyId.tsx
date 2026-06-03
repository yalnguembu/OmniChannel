import { createFileRoute } from "@tanstack/react-router";
import { ACTION } from "@/security/enums";
import { requirePermission } from "@/security/guards";
import CompanyDetailPage from "@/pages/admin/companies/CompanyDetailPage";

export const Route = createFileRoute("/admin/companies/$companyId")({
  component: CompanyDetailPage,
  beforeLoad: ({ context }) => {
    requirePermission(context.user, context.strategy, {
      action: ACTION.COMPANY_READ,
      redirectTo: "/forbidden",
    });
  },
});
