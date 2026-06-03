import { Pagination } from "@/components/data-table/DataTable";
import { useAdminIntegrationsViewModel } from "@/hooks/admin/useAdminIntegrationsViewModel";
import { IntegrationsTable } from "@/components/features/admin/integrations/IntegrationsTable";

export default function IntegrationsPage() {
  const vm = useAdminIntegrationsViewModel();

  return (
    <div className="p-7">
      <div className="mb-5">
        <h1 className="text-[20px] font-semibold text-[#0D2137] tracking-tight">
          Intégrations
        </h1>
        <p className="text-[12.5px] text-[#4A7A94] mt-1">
          {vm.total.toLocaleString("fr")} intégrations
        </p>
      </div>

      <IntegrationsTable
        integrations={vm.integrations}
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
