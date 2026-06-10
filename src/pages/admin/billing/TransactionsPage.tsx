import { Pagination } from "@/components/data-table/DataTable";
import { useAdminTransactionsViewModel } from "@/hooks/admin/useAdminTransactionsViewModel";
import { AdminBillingTabs } from "@/components/features/admin/billing/AdminBillingTabs";
import { TransactionsTable } from "@/components/features/admin/billing/TransactionsTable";

export default function TransactionsPage() {
  const vm = useAdminTransactionsViewModel();

  const kpis = [
    { label: "Crédits", value: vm.creditCount, color: "#16A34A" },
    { label: "Débits", value: vm.debitCount, color: "#DC2626" },
    { label: "Total", value: vm.total, color: "#0D2137" },
  ];

  return (
    <div className="p-7">
      <h1 className="text-[20px] font-semibold text-[#0D2137] tracking-tight mb-1">
        Facturation admin
      </h1>
      <p className="text-[12.5px] text-[#4A7A94] mb-4">
        Transactions wallet cross-companies
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
              {k.value.toLocaleString("fr")}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-[13px] text-[#4A7A94]">
          {vm.total.toLocaleString("fr")} transactions
        </p>
      </div>

      <TransactionsTable
        transactions={vm.transactions}
        isLoading={vm.isLoading}
      />

      <Pagination
        total={vm.total}
        pageSize={vm.pageSize}
        page={vm.page}
        onChange={vm.setPage}
      />
    </div>
  );
}
