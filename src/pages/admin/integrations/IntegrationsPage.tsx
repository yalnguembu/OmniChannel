import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { Can } from "@/security/components/Can";
import { ACTION } from "@/security/enums";
import { useAdminIntegrationsViewModel } from "@/hooks/admin/useAdminIntegrationsViewModel";
import { IntegrationsTable } from "@/components/features/admin/integrations/IntegrationsTable";
import { IntegrationFormModal } from "@/components/features/admin/integrations/IntegrationFormModal";
import { ConfigureIntegrationModal } from "@/components/features/admin/integrations/ConfigureIntegrationModal";

export default function IntegrationsPage() {
  const vm = useAdminIntegrationsViewModel();

  return (
    <div className="p-7">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h1 className="text-[20px] font-semibold text-[#0D2137] tracking-tight">
            Intégrations
          </h1>
          <p className="text-[12.5px] text-[#4A7A94] mt-1">
            {vm.total.toLocaleString("fr")} intégrations · {vm.activeCount}{" "}
            actives
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SearchInput
            placeholder="Rechercher…"
            value={vm.search}
            onChange={(e) => vm.setSearch(e.target.value)}
            containerClassName="w-48"
          />
          <Can perform={ACTION.INTEGRATION_WRITE}>
            <Button variant="primary" onClick={vm.handleOpenCreate}>
              <Plus size={13} />
              Nouvelle intégration
            </Button>
          </Can>
        </div>
      </div>

      <IntegrationsTable
        integrations={vm.integrations}
        isLoading={vm.isLoading}
        onConfigure={vm.handleOpenConfigure}
        onEdit={vm.handleOpenEdit}
        onDelete={vm.handleDelete}
        pagination={{
          total: vm.total,
          pageSize: vm.pageSize,
          page: vm.page,
          onPageChange: vm.setPage,
        }}
      />

      <IntegrationFormModal
        isOpen={vm.isFormOpen}
        onClose={vm.handleCloseForm}
        editing={vm.editingIntegration}
        companies={vm.companies}
        onSubmit={vm.handleSubmit}
        isPending={vm.isActionPending}
      />

      <ConfigureIntegrationModal
        isOpen={vm.isConfigureOpen}
        onClose={vm.handleCloseConfigure}
        editing={vm.editingIntegration}
        onSubmit={vm.handleConfigureSubmit}
        isPending={vm.isConfigurePending}
      />
    </div>
  );
}
