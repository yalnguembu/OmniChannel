import { useState } from "react";
import { Plus, Trash2, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ListFilterBar } from "@/components/features/shared/ListFilterBar";
import { useProductFlows } from "@/hooks/useProductFlows";
import { FlowFormModal } from "./FlowFormModal";
import type { FlowDto } from "@/shared/api/generated/types.gen";
import { useQuery } from "@tanstack/react-query";
import { getApiSenderDropdownOptions } from "@/shared/api/generated/@tanstack/react-query.gen";

interface FlowsTabProps {
  productId: string;
}

export function FlowsTab({ productId }: FlowsTabProps) {
  const vm = useProductFlows(productId);
  const [editingFlow, setEditingFlow] = useState<FlowDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: senders = [] } = useQuery({
    ...getApiSenderDropdownOptions(),
    select: (res) => (res?.data ?? []) as { id?: string; name?: string | null }[],
  });

  const getSenderName = (id?: string | null) => {
    if (!id) return "Aucun";
    return senders.find((s) => s.id === id)?.name || id;
  };

  const handleEdit = (flow: FlowDto) => {
    setEditingFlow(flow);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingFlow(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce flux ?")) {
      vm.deleteFlow({ path: { id } });
    }
  };

  const handleSave = async (data: Partial<FlowDto>) => {
    if (editingFlow) {
      await vm.updateFlow({ body: { ...data, id: editingFlow.id } });
    } else {
      await vm.createFlow({ body: data as any });
    }
  };

  return (
    <div className="space-y-6">
      <ListFilterBar
        search={vm.search.query}
        onSearchChange={vm.search.setQuery}
        searchPlaceholder="Rechercher par nom ou code..."
        actions={[
          {
            label: "Nouveau Flux",
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
              Aucun flux n'a été trouvé.
            </p>
            <Button variant="secondary" size="sm" onClick={handleCreate}>
              Créer votre premier flux
            </Button>
          </div>
        )}

        {vm.data?.items?.map((flow) => (
          <div
            key={flow.id}
            className="flex items-center justify-between rounded-lg border border-[#E5E7EB] bg-white p-4 hover:border-[#CBD5E1] transition-colors"
          >
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-[14px] font-semibold text-[#0D2137]">
                  {flow.name || "Sans nom"}
                </h3>
                <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[11px] font-medium text-[#4A7A94]">
                  {flow.code}
                </span>
                {flow.status === "Published" && (
                  <span className="rounded-full bg-[#ECFDF5] px-2 py-0.5 text-[11px] font-medium text-[#059669]">
                    Publié
                  </span>
                )}
                {flow.status === "Draft" && (
                  <span className="rounded-full bg-[#FFFBEB] px-2 py-0.5 text-[11px] font-medium text-[#D97706]">
                    Brouillon
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-4 text-[12px] text-[#8BAFC0]">
                <span>Sender: {getSenderName(flow.senderId)}</span>
                {flow.provider && <span>Provider: {flow.provider}</span>}
                {flow.flowAction && <span>Action: {flow.flowAction}</span>}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => handleEdit(flow)}>
                <Edit size={14} className="mr-2" />
                Modifier
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(flow.id!)}>
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

      <FlowFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editing={editingFlow}
        lockedProductId={productId}
        onSave={handleSave}
        isSaving={vm.isMutating}
      />
    </div>
  );
}
