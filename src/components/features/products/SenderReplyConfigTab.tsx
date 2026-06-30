import { useState } from "react";
import { Plus, Trash2, Edit, Bot, MessageSquareText, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ListFilterBar } from "@/components/features/shared/ListFilterBar";
import { useProductSenderReplyConfigs } from "@/hooks/useProductSenderReplyConfigs";
import { SenderReplyConfigFormModal } from "./SenderReplyConfigFormModal";
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
    <div className="space-y-6">
      <ListFilterBar
        search={vm.search.query}
        onSearchChange={vm.search.setQuery}
        searchPlaceholder="Rechercher par sender..."
        actions={[
          {
            label: "Nouvelle configuration",
            icon: <Plus size={13} strokeWidth={2.5} />,
            onClick: handleCreate,
          },
        ]}
      />

      <div className="space-y-3">
        {vm.isLoading && (
          <div className="flex justify-center p-8 text-[#8BAFC0] text-[13px]">
            Chargement...
          </div>
        )}

        {!vm.isLoading && vm.data?.items?.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-[#E5E7EB] rounded-lg">
            <p className="text-[13px] text-[#4A7A94] mb-4">
              Aucune configuration d'auto-réponse n'a été créée.
            </p>
            <Button variant="secondary" size="sm" onClick={handleCreate}>
              Créer une configuration
            </Button>
          </div>
        )}

        {vm.data?.items?.map((config) => (
          <div
            key={config.id}
            className="flex items-center justify-between rounded-lg border border-[#E5E7EB] bg-white p-4 hover:border-[#CBD5E1] transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EFF6FF]">
                <MessageSquareText size={18} className="text-[#3B82F6]" />
              </div>
              <div>
                <h3 className="text-[14px] font-semibold text-[#0D2137]">
                  {getSenderName(config.senderId)}
                </h3>
                <div className="mt-1.5 flex items-center gap-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      config.autoReplyEnabled
                        ? "bg-[#ECFDF5] text-[#059669]"
                        : "bg-[#F3F4F6] text-[#6B7280]"
                    }`}
                  >
                    Auto-reply {config.autoReplyEnabled ? "activé" : "désactivé"}
                  </span>
                  {config.aiReplyEnabled && (
                    <span className="flex items-center gap-1 rounded-full bg-[#EDE9FE] px-2 py-0.5 text-[11px] font-medium text-[#7C3AED]">
                      <Bot size={10} />
                      IA activée
                    </span>
                  )}
                  {config.autoReplyDelaySeconds ? (
                    <span className="text-[12px] text-[#8BAFC0]">
                      Délai : {config.autoReplyDelaySeconds}s
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => handleEdit(config)}>
                <Edit size={14} className="mr-2" />
                Modifier
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(config.id!)}>
                <Trash2 size={14} className="text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {vm.data?.totalCount && vm.data.totalCount > vm.pagination.pageSize ? (
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="secondary" size="sm" onClick={() => vm.pagination.setPageIndex(vm.pagination.pageIndex - 1)} disabled={vm.pagination.pageIndex === 0}>
            <ChevronLeft size={14} />
          </Button>
          <span className="text-[13px] text-[#4A7A94]">Page {vm.pagination.pageIndex + 1}</span>
          <Button variant="secondary" size="sm" onClick={() => vm.pagination.setPageIndex(vm.pagination.pageIndex + 1)} disabled={(vm.pagination.pageIndex + 1) * vm.pagination.pageSize >= (vm.data?.totalCount ?? 0)}>
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
