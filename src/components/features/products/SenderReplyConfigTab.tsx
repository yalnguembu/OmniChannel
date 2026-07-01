import { useState } from "react";
import { Plus, MessageSquareText, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ListFilterBar } from "@/components/features/shared/ListFilterBar";
import { useProductSenderReplyConfigs } from "@/hooks/useProductSenderReplyConfigs";
import { SenderReplyConfigFormModal } from "./SenderReplyConfigFormModal";
import { SenderReplyConfigCard } from "./SenderReplyConfigCard";
import type { SearchSenderReplyConfigResponse } from "@/shared/api/generated/types.gen";
import { useQuery } from "@tanstack/react-query";
import { getApiSenderDropdownOptions } from "@/shared/api/generated/@tanstack/react-query.gen";

interface SenderReplyConfigTabProps {
  productId: string;
}

export function SenderReplyConfigTab({ productId }: SenderReplyConfigTabProps) {
  const vm = useProductSenderReplyConfigs(productId);
  const [editingConfig, setEditingConfig] = useState<SearchSenderReplyConfigResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: senders = [] } = useQuery({
    ...getApiSenderDropdownOptions(),
    select: (res) => (res?.data ?? []) as { id?: string; name?: string | null }[],
  });

  const getSenderName = (id?: string) => senders.find((s) => s.id === id)?.name || id || "—";

  const handleEdit = (config: SearchSenderReplyConfigResponse) => {
    setEditingConfig(config);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingConfig(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette configuration ?")) {
      vm.deleteConfig({ path: { id } });
    }
  };

  const handleSave = async (data: any) => {
    if (editingConfig) {
      await vm.updateConfig({ body: data });
    } else {
      await vm.createConfig({ body: data });
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-[14px] border border-[#E5E7EB] overflow-hidden">
        <ListFilterBar
          search={vm.search.query}
          onSearchChange={vm.search.setQuery}
          searchPlaceholder="Rechercher par sender…"
          actions={[
            {
              label: "Nouvelle configuration",
              icon: <Plus size={13} strokeWidth={2.5} />,
              onClick: handleCreate,
            },
          ]}
        />
      </div>

      {vm.isLoading ? (
        <div className="flex justify-center p-8 text-[#8BAFC0] text-[13px]">Chargement...</div>
      ) : vm.data?.items?.length === 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden p-5">
          <div className="py-20 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#F7F8F9] flex items-center justify-center mb-6">
              <MessageSquareText size={32} className="text-[#B8CDD8] opacity-50" />
            </div>
            <h3 className="text-[17px] font-bold text-[#0D2137]">
              Aucune configuration d'auto-réponse
            </h3>
            <p className="text-[13.5px] text-[#8BAFC0] mt-2 mb-8 max-w-85">
              Créez une configuration pour répondre automatiquement aux messages
              entrants d'un sender.
            </p>
            <Button variant="primary" size="sm" onClick={handleCreate}>
              <Plus size={14} className="mr-2" /> Créer maintenant
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[14px]">
          {vm.data?.items?.map((config) => (
            <SenderReplyConfigCard
              key={config.id}
              config={config}
              senderName={getSenderName(config.senderId)}
              onEdit={() => handleEdit(config)}
              onDelete={() => handleDelete(config.id!)}
            />
          ))}
        </div>
      )}

      {vm.data?.totalCount && vm.data.totalCount > vm.pagination.pageSize ? (
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => vm.pagination.setPageIndex(vm.pagination.pageIndex - 1)}
            disabled={vm.pagination.pageIndex === 0}
          >
            <ChevronLeft size={14} />
          </Button>
          <span className="text-[13px] text-[#4A7A94]">Page {vm.pagination.pageIndex + 1}</span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => vm.pagination.setPageIndex(vm.pagination.pageIndex + 1)}
            disabled={(vm.pagination.pageIndex + 1) * vm.pagination.pageSize >= (vm.data?.totalCount ?? 0)}
          >
            <ChevronRight size={14} />
          </Button>
        </div>
      ) : null}

      <SenderReplyConfigFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editing={editingConfig}
        onSave={handleSave}
        isSaving={vm.isMutating}
      />
    </div>
  );
}
