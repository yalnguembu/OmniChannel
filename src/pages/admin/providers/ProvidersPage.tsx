import { Plus, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { ViewToggle } from "@/components/ui/ViewToggle";
import { PageLoader } from "@/components/feedback/PageLoader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Pagination } from "@/components/data-table/DataTable";
import { Can } from "@/security/components/Can";
import { ACTION } from "@/security/enums";
import { staggerContainer } from "@/lib/animations";
import { useProvidersViewModel } from "@/hooks/admin/useProvidersViewModel";
import { ProviderCard } from "@/components/features/admin/providers/ProviderCard";
import { ProvidersTable } from "@/components/features/admin/providers/ProvidersTable";
import { ProviderFormModal } from "@/components/features/admin/providers/ProviderFormModal";

export default function ProvidersPage() {
  const vm = useProvidersViewModel();

  const createButton = (
    <Can perform={ACTION.PROVIDER_WRITE}>
      <Button variant="primary" onClick={vm.handleOpenCreate}>
        <Plus size={13} />
        Nouveau provider
      </Button>
    </Can>
  );

  return (
    <div className="p-7">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h1 className="text-[20px] font-semibold text-[#0D2137] tracking-tight">
            Providers
          </h1>
          <p className="text-[12.5px] text-[#4A7A94] mt-1">
            {vm.total} providers · {vm.activeCount} actifs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SearchInput
            placeholder="Rechercher…"
            value={vm.search}
            onChange={(e) => vm.setSearch(e.target.value)}
            containerClassName="w-48"
          />
          <ViewToggle view={vm.view} onChange={vm.setView} />
          {createButton}
        </div>
      </div>

      {vm.isLoading ? (
        <PageLoader />
      ) : vm.providers.length === 0 ? (
        <EmptyState
          icon={<ExternalLink size={32} />}
          title="Aucun provider"
          description="Ajoutez vos providers de messagerie"
          action={createButton}
        />
      ) : vm.view === "card" ? (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-3 gap-4 mb-5"
        >
          {vm.providers.map((p) => (
            <ProviderCard key={p.id} provider={p} onEdit={vm.handleOpenEdit} />
          ))}
        </motion.div>
      ) : (
        <div className="mb-5">
          <ProvidersTable
            providers={vm.providers}
            isLoading={vm.isLoading}
            onEdit={vm.handleOpenEdit}
          />
        </div>
      )}

      <Pagination
        total={vm.total}
        pageSize={vm.pageSize}
        page={vm.page}
        onChange={vm.setPage}
      />

      <ProviderFormModal
        isOpen={vm.isModalOpen}
        onClose={vm.handleCloseModal}
        editing={vm.editingProvider}
        onSubmit={vm.handleSubmit}
        isPending={vm.isActionPending}
      />
    </div>
  );
}
