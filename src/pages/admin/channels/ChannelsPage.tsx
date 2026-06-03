import { Plus, Radio } from "lucide-react";
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
import { useAdminChannelsViewModel } from "@/hooks/admin/useAdminChannelsViewModel";
import { ChannelCard } from "@/components/features/admin/channels/ChannelCard";
import { ChannelsTable } from "@/components/features/admin/channels/ChannelsTable";
import { ChannelFormModal } from "@/components/features/admin/channels/ChannelFormModal";

export default function ChannelsPage() {
  const vm = useAdminChannelsViewModel();

  const createButton = (
    <Can perform={ACTION.CHANNEL_WRITE}>
      <Button variant="primary" onClick={vm.handleOpenCreate}>
        <Plus size={13} />
        Nouveau canal
      </Button>
    </Can>
  );

  return (
    <div className="p-7">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h1 className="text-[20px] font-semibold text-[#0D2137] tracking-tight">
            Canaux
          </h1>
          <p className="text-[12.5px] text-[#4A7A94] mt-1">
            {vm.total} canaux · {vm.activeCount} actifs
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
      ) : vm.channels.length === 0 ? (
        <EmptyState
          icon={<Radio size={32} />}
          title="Aucun canal"
          description="Configurez les canaux de la plateforme"
          action={createButton}
        />
      ) : vm.view === "card" ? (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-3 gap-4 mb-5"
        >
          {vm.channels.map((ch) => (
            <ChannelCard key={ch.id} channel={ch} onEdit={vm.handleOpenEdit} />
          ))}
        </motion.div>
      ) : (
        <div className="mb-5">
          <ChannelsTable
            channels={vm.channels}
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

      <ChannelFormModal
        isOpen={vm.isModalOpen}
        onClose={vm.handleCloseModal}
        editing={vm.editingChannel}
        onSubmit={vm.handleSubmit}
        isPending={vm.isActionPending}
      />
    </div>
  );
}
