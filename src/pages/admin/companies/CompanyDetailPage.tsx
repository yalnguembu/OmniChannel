import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageLoader } from "@/components/feedback/PageLoader";
import { useAdminCompanyDetailViewModel } from "@/hooks/admin/useAdminCompanyDetailViewModel";
import { CompanyDetailHeader } from "@/components/features/admin/companies/CompanyDetailHeader";
import { CompanyInfoTab } from "@/components/features/admin/companies/CompanyInfoTab";
import { CompanySubscriptionTab } from "@/components/features/admin/companies/CompanySubscriptionTab";
import { CompanyWalletTab } from "@/components/features/admin/companies/CompanyWalletTab";
import { CompanyUsersTab } from "@/components/features/admin/companies/CompanyUsersTab";

const TABS = [
  { id: "info", label: "Informations" },
  { id: "subscription", label: "Abonnement" },
  { id: "wallet", label: "Wallet" },
  { id: "users", label: "Utilisateurs" },
];

export default function CompanyDetailPage() {
  const { companyId } = useParams({ from: "/admin/companies/$companyId" });
  const navigate = useNavigate();
  const vm = useAdminCompanyDetailViewModel(companyId);

  if (vm.isLoading) return <PageLoader />;

  if (!vm.company) {
    return (
      <div className="p-7">
        <p className="text-[13px] text-[#8BAFC0]">Company introuvable.</p>
      </div>
    );
  }

  return (
    <div className="p-7">
      <button
        onClick={() => navigate({ to: "/admin/companies" })}
        className="flex items-center gap-1.5 text-[12.5px] text-[#4A7A94] hover:text-[#0D2137] transition-colors mb-4 cursor-pointer"
      >
        <ArrowLeft size={14} />
        Retour aux companies
      </button>

      <CompanyDetailHeader company={vm.company} />

      <div className="flex border-b border-[#E5E7EB] mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => vm.setTab(t.id)}
            className={cn(
              "px-4 py-2.5 text-[13px] border-b-2 border-transparent transition-all cursor-pointer",
              vm.tab === t.id
                ? "text-[#1B5E82] font-medium !border-[#2E8FAD]"
                : "text-[#4A7A94] hover:text-[#0D2137]",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {vm.tab === "info" && <CompanyInfoTab company={vm.company} />}
      {vm.tab === "subscription" && (
        <CompanySubscriptionTab subscription={vm.subscription} />
      )}
      {vm.tab === "wallet" && (
        <CompanyWalletTab wallet={vm.wallet} transactions={vm.transactions} />
      )}
      {vm.tab === "users" && <CompanyUsersTab companyId={companyId} />}
    </div>
  );
}
