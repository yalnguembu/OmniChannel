import { PageLoader } from "@/components/feedback/PageLoader";
import { useAdminDashboardViewModel } from "@/hooks/admin/useAdminDashboardViewModel";
import { DashboardKPIs } from "@/components/features/admin/dashboard/DashboardKPIs";
import { PendingInvoicesAlert } from "@/components/features/admin/dashboard/PendingInvoicesAlert";
import { RecentCompaniesCard } from "@/components/features/admin/dashboard/RecentCompaniesCard";
import { PendingInvoicesCard } from "@/components/features/admin/dashboard/PendingInvoicesCard";

export default function DashboardPage() {
  const vm = useAdminDashboardViewModel();

  if (vm.isLoading) return <PageLoader />;

  return (
    <div className="p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[20px] font-semibold text-[#0D2137] tracking-tight">
            Dashboard Admin
          </h1>
          <p className="text-[12.5px] text-[#4A7A94] mt-1">
            Vue globale de la plateforme OmniChannel
          </p>
        </div>
      </div>

      {/* Pending invoices alert */}
      <PendingInvoicesAlert
        pendingInvoicesCount={vm.pendingInvoicesCount}
        pendingInvoiceAmount={vm.pendingInvoiceAmount}
      />

      {/* KPIs */}
      <DashboardKPIs
        activeCompanies={vm.activeCompanies}
        companiesCount={vm.companiesCount}
        totalMessages={vm.totalMessages}
        totalUsers={vm.totalUsers}
        activeProviders={vm.activeProviders}
      />

      <div className="grid grid-cols-2 gap-5">
        {/* Companies récentes */}
        <RecentCompaniesCard companies={vm.companies} />

        {/* Factures en attente */}
        <PendingInvoicesCard pendingInvoices={vm.pendingInvoices} />
      </div>
    </div>
  );
}
