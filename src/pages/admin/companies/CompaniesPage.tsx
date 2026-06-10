import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { ViewToggle } from "@/components/ui/ViewToggle";
import { Pagination } from "@/components/data-table/DataTable";
import { PageLoader } from "@/components/feedback/PageLoader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Can } from "@/security/components/Can";
import { ACTION } from "@/security/enums";
import { cn } from "@/lib/utils";
import { staggerContainer } from "@/lib/animations";
import { useAdminCompaniesViewModel } from "@/hooks/admin/useAdminCompaniesViewModel";
import { CompanyCard } from "@/components/features/admin/companies/CompanyCard";
import { CompaniesTable } from "@/components/features/admin/companies/CompaniesTable";
import { CompanyFormModal } from "@/components/features/admin/companies/CompanyFormModal";

export default function CompaniesPage() {
  const vm = useAdminCompaniesViewModel();
  const navigate = useNavigate();

  const goToDetail = (companyId: string) =>
    navigate({
      to: "/admin/companies/$companyId",
      params: { companyId },
    });

  return (
    <div className="p-7">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h1 className="text-[20px] font-semibold text-[#0D2137] tracking-tight">
            Companies
          </h1>
          <p className="text-[12.5px] text-[#4A7A94] mt-1">
            {vm.total.toLocaleString("fr")} companies enregistrées
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SearchInput
            placeholder="Nom, email, pays…"
            value={vm.search}
            onChange={(e) => vm.setSearch(e.target.value)}
            containerClassName="w-56"
          />
          <ViewToggle view={vm.view} onChange={vm.setView} />
          <Can perform={ACTION.COMPANY_WRITE}>
            <Button variant="primary" onClick={vm.handleOpenCreate}>
              <Plus size={13} />
              Nouvelle company
            </Button>
          </Can>
        </div>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap items-center">
        {vm.filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => vm.setStatusFilter(tab.id)}
            className={cn(
              "text-[12.5px] px-4 py-1.5 rounded-full border transition-all cursor-pointer",
              vm.statusFilter === tab.id
                ? "bg-[#0D2137] text-white border-[#0D2137] font-medium"
                : "bg-white text-[#4A7A94] border-[#E5E7EB] hover:bg-[#F0F2F4]",
            )}
          >
            {tab.label}
          </button>
        ))}
        <span className="ml-auto text-[12px] text-[#8BAFC0]">
          {vm.total} résultats
        </span>
      </div>

      {vm.isLoading ? (
        <PageLoader />
      ) : vm.companies.length === 0 ? (
        <EmptyState
          icon={<Building2 size={32} />}
          title="Aucune company"
          description="Les companies inscrites apparaîtront ici"
        />
      ) : vm.view === "card" ? (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-3 gap-4 mb-5"
        >
          {vm.companies.map((c) => (
            <CompanyCard key={c.id} c={c} onClick={() => goToDetail(c.id ?? "")} />
          ))}
        </motion.div>
      ) : (
        <div className="mb-5">
          <CompaniesTable
            companies={vm.companies}
            isLoading={vm.isLoading}
            onRowClick={(c) => goToDetail(c.id ?? "")}
          />
        </div>
      )}
      <Pagination
        total={vm.total}
        pageSize={vm.pageSize}
        page={vm.page}
        onChange={vm.setPage}
      />

      <CompanyFormModal
        isOpen={vm.isFormOpen}
        onClose={vm.handleCloseForm}
        countries={vm.countries}
        onSubmit={vm.handleSubmit}
        isPending={vm.isActionPending}
      />
    </div>
  );
}
