import { useState } from "react";
import { Plus, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ListFilterBar } from "@/components/features/shared/ListFilterBar";
import { useProductFunnels } from "@/hooks/useProductFunnels";
import { FunnelFormModal } from "./FunnelFormModal";
import { FunnelCard } from "./funnels/FunnelCard";
import type { EventFunnelDto } from "@/shared/api/generated/types.gen";

interface FunnelsTabProps {
  productId: string;
}

export function FunnelsTab({ productId }: FunnelsTabProps) {
  const vm = useProductFunnels(productId);
  const [editingFunnel, setEditingFunnel] = useState<EventFunnelDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEdit = (funnel: EventFunnelDto) => {
    setEditingFunnel(funnel);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingFunnel(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce tunnel ?")) {
      vm.deleteFunnel({ path: { id } });
    }
  };

  const handleSave = async (data: Partial<EventFunnelDto>) => {
    if (editingFunnel) {
      await vm.updateFunnel({ body: { ...data, id: editingFunnel.id } });
    } else {
      await vm.createFunnel({ body: data as any });
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
              label: "Nouveau tunnel",
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
              <Filter size={32} className="text-[#B8CDD8] opacity-50" />
            </div>
            <h3 className="text-[17px] font-bold text-[#0D2137]">Aucun tunnel</h3>
            <p className="text-[13.5px] text-[#8BAFC0] mt-2 mb-8 max-w-85">
              Créez un tunnel pour suivre la conversion de vos contacts à travers
              une suite d'événements.
            </p>
            <Button variant="primary" size="sm" onClick={handleCreate}>
              <Plus size={14} className="mr-2" /> Créer maintenant
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[14px]">
          {vm.data?.items?.map((funnel) => (
            <FunnelCard
              key={funnel.id}
              productId={productId}
              funnel={funnel}
              onEdit={() => handleEdit(funnel)}
              onDelete={() => handleDelete(funnel.id!)}
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

      <FunnelFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editing={editingFunnel}
        lockedProductId={productId}
        onSave={handleSave}
        isSaving={vm.isMutating}
      />
    </div>
  );
}
