import { SearchInput } from "@/components/ui/SearchInput";
import { Pagination } from "@/components/data-table/DataTable";
import { formatCurrency } from "@/lib/currency";
import { useAdminInvoicesViewModel } from "@/hooks/admin/useAdminInvoicesViewModel";
import { AdminBillingTabs } from "@/components/features/admin/billing/AdminBillingTabs";
import { InvoicesTable } from "@/components/features/admin/billing/InvoicesTable";

export default function InvoicesPage() {
  const vm = useAdminInvoicesViewModel();

  const kpis = [
    { label: "Payé", value: formatCurrency(vm.paidAmt), color: "#16A34A" },
    { label: "En attente", value: formatCurrency(vm.pendingAmt), color: "#D97706" },
    { label: "En retard", value: formatCurrency(vm.overdueAmt), color: "#DC2626" },
  ];

  return (
    <div className="p-7">
      <h1 className="text-[20px] font-semibold text-[#0D2137] tracking-tight mb-1">
        Facturation admin
      </h1>
      <p className="text-[12.5px] text-[#4A7A94] mb-4">
        Vue globale cross-companies
      </p>

      <AdminBillingTabs />

      <div className="grid grid-cols-3 gap-4 mb-5">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="bg-white border border-[#E5E7EB] rounded-md px-4 py-3.5"
          >
            <p className="text-[11px] text-[#8BAFC0] uppercase tracking-[0.06em] mb-1">
              {k.label}
            </p>
            <p
              className="text-[20px] font-semibold tracking-tight"
              style={{ color: k.color }}
            >
              {k.value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-[13px] text-[#4A7A94]">
          {vm.total.toLocaleString("fr")} factures
        </p>
        <SearchInput
          placeholder="Rechercher…"
          value={vm.search}
          onChange={(e) => vm.setSearch(e.target.value)}
          containerClassName="w-56"
        />
      </div>

      <InvoicesTable invoices={vm.invoices} isLoading={vm.isLoading} />

      <Pagination
        total={vm.total}
        pageSize={vm.pageSize}
        page={vm.page}
        onChange={vm.setPage}
      />
    </div>
  );
}
