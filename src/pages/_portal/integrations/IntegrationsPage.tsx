import { Plus, Network } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { PageLoader } from "@/components/feedback/PageLoader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Pagination } from "@/components/data-table/DataTable";
import { Can } from "@/security/components/Can";
import { ACTION } from "@/security/enums";
import { staggerContainer } from "@/lib/animations";
import { useIntegrationsViewModel } from "@/hooks/useIntegrationsViewModel";
import { IntegrationCard } from "@/components/features/integrations/IntegrationCard";
import { IntegrationFormModal } from "@/components/features/integrations/IntegrationFormModal";
import { ConfigureIntegrationModal } from "@/components/features/integrations/ConfigureIntegrationModal";
import { IntegrationsTabs } from "./IntegrationsTabs";

export default function IntegrationsPage() {
  const vm = useIntegrationsViewModel();

  const createButton = (
    <Can perform={ACTION.INTEGRATION_WRITE}>
      <Button variant="primary" onClick={vm.handleOpenCreate}>
        <Plus size={13} />
        Nouvelle intégration
      </Button>
    </Can>
  );

  return (
    <div className="p-7">
      <div className="mb-2">
        <h1 className="text-[20px] font-semibold text-[#0D2137] tracking-tight">
          Intégrations
        </h1>
        <p className="text-[12.5px] text-[#4A7A94] mt-1">
          Connecteurs, webhooks, API Keys & logs
        </p>
      </div>

      <IntegrationsTabs />

      <div className="flex items-center justify-between mb-5">
        <p className="text-[13px] text-[#4A7A94]">
          {vm.total.toLocaleString("fr")} intégration{vm.total !== 1 ? "s" : ""} ·{" "}
          {vm.activeCount} active{vm.activeCount !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-2">
          <SearchInput
            placeholder="Rechercher…"
            value={vm.search}
            onChange={(e) => vm.setSearch(e.target.value)}
            containerClassName="w-48"
          />
          {createButton}
        </div>
      </div>

      {vm.isLoading ? (
        <PageLoader />
      ) : vm.integrations.length === 0 ? (
        <EmptyState
          icon={<Network size={32} />}
          title="Aucune intégration"
          description="Connectez une source de données externe (CRM, ERP, API…)"
          action={createButton}
        />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-3 gap-4 mb-5"
        >
          {vm.integrations.map((i) => (
            <IntegrationCard
              key={i.id}
              integration={i}
              onConfigure={vm.handleOpenConfigure}
              onEdit={vm.handleOpenEdit}
              onDelete={vm.handleDelete}
            />
          ))}
        </motion.div>
      )}

      <Pagination
        total={vm.total}
        pageSize={vm.pageSize}
        page={vm.page}
        onChange={vm.setPage}
      />

      <IntegrationFormModal
        isOpen={vm.isFormOpen}
        onClose={vm.handleCloseForm}
        editing={vm.editingIntegration}
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
