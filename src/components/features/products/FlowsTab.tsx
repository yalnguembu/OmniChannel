import { useState } from "react";
import { Plus, Workflow, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ListFilterBar } from "@/components/features/shared/ListFilterBar";
import { useProductFlows } from "@/hooks/useProductFlows";
import { FlowFormModal } from "./FlowFormModal";
import { FlowCard } from "./flows/FlowCard";
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
    <div className="space-y-4">
      <div className="rounded-[14px] border border-[#E5E7EB] overflow-hidden">
        <ListFilterBar
          search={vm.search.query}
          onSearchChange={vm.search.setQuery}
          searchPlaceholder="Rechercher par nom ou code…"
          actions={[
            {
              label: "Nouveau flux",
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
              <Workflow size={32} className="text-[#B8CDD8] opacity-50" />
            </div>
            <h3 className="text-[17px] font-bold text-[#0D2137]">Aucun flux</h3>
            <p className="text-[13.5px] text-[#8BAFC0] mt-2 mb-8 max-w-85">
              Créez un flux pour orchestrer l'envoi de messages interactifs
              (WhatsApp Flow).
            </p>
            <Button variant="primary" size="sm" onClick={handleCreate}>
              <Plus size={14} className="mr-2" /> Créer maintenant
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[14px]">
          {vm.data?.items?.map((flow) => (
            <FlowCard
              key={flow.id}
              flow={flow}
              senderName={getSenderName(flow.senderId)}
              onEdit={() => handleEdit(flow)}
              onDelete={() => handleDelete(flow.id!)}
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
