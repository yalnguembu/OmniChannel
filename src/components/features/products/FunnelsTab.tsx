import { useState } from "react";
import { Plus, ChartNoAxesCombined, Trash2, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ListFilterBar } from "@/components/features/shared/ListFilterBar";
import { useProductFunnels } from "@/hooks/useProductFunnels";
import { FunnelFormModal } from "./FunnelFormModal";
import { FunnelDashboard } from "./FunnelDashboard";
import type { EventFunnelDto } from "@/shared/api/generated/types.gen";

interface FunnelsTabProps {
  productId: string;
}

export function FunnelsTab({ productId }: FunnelsTabProps) {
  const vm = useProductFunnels(productId);
  const [editingFunnel, setEditingFunnel] = useState<EventFunnelDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportFunnelId, setReportFunnelId] = useState<string | null>(null);

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
    <div className="space-y-6">
      <ListFilterBar
        search={vm.search.query}
        onSearchChange={vm.search.setQuery}
        searchPlaceholder="Rechercher par nom ou code..."
        actions={[
          {
            label: "Nouveau Tunnel",
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
              Aucun tunnel n'a été configuré.
            </p>
            <Button variant="secondary" size="sm" onClick={handleCreate}>
              Créer votre premier tunnel
            </Button>
          </div>
        )}

        {vm.data?.items?.map((funnel) => (
          <div
            key={funnel.id}
            className="flex items-center justify-between rounded-lg border border-[#E5E7EB] bg-white p-4 hover:border-[#CBD5E1] transition-colors"
          >
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-[14px] font-semibold text-[#0D2137]">
                  {funnel.name || "Sans nom"}
                </h3>
                <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[11px] font-medium text-[#4A7A94]">
                  {funnel.code}
                </span>
                {!funnel.isActive && (
                  <span className="rounded-full bg-[#FFFBEB] px-2 py-0.5 text-[11px] font-medium text-[#D97706]">
                    Inactif
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setReportFunnelId(funnel.id ?? null)}>
                <ChartNoAxesCombined size={14} className="mr-2" />
                Rapports
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleEdit(funnel)}>
                <Edit size={14} className="mr-2" />
                Configurer les étapes
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(funnel.id!)}>
                <Trash2 size={14} className="text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {reportFunnelId && (
        <div className="pt-2">
          <FunnelDashboard funnelId={reportFunnelId} />
        </div>
      )}

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
