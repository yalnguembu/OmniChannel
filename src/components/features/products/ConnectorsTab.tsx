import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Plug, Trash2, Settings, Edit } from "lucide-react";
import { toast } from "sonner";
import {
  postApiConnectorSearchQueryKey,
  deleteApiConnectorByIdMutation,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import type { SearchConnectorResponse } from "@/shared/api/generated/types.gen";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/feedback/PageLoader";
import { ListFilterBar } from "@/components/features/shared/ListFilterBar";
import { ConnectorFormModal } from "@/components/features/connectors/ConnectorFormModal";
import { ConnectorConfigModal } from "@/components/features/connectors/ConnectorConfigModal";
import { formatRelative } from "@/lib/date";
import { cn } from "@/lib/utils";
import { useProductConnectors } from "@/hooks/useProductConnectors";

interface ConnectorsTabProps {
  productId: string;
}

export function ConnectorsTab({ productId }: ConnectorsTabProps) {
  const qc = useQueryClient();
  const vm = useProductConnectors(productId);
  const f = vm.filters;

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SearchConnectorResponse | null>(null);
  const [configureId, setConfigureId] = useState<string | null>(null);
  const [configureName, setConfigureName] = useState<string>("");

  const deleteMutation = useMutation({
    ...deleteApiConnectorByIdMutation(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: postApiConnectorSearchQueryKey() });
      toast.success("Connecteur supprimé");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (c: SearchConnectorResponse) => {
    setEditing(c);
    setFormOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-[14px] border border-[#E5E7EB] overflow-hidden">
        <ListFilterBar
          search={f.search}
          onSearchChange={f.setSearch}
          searchPlaceholder="Rechercher un connecteur…"
          dateRange={f.dateRange}
          onDateRangeChange={f.setDateRange}
          advancedFields={vm.filterFields}
          advancedValues={f.advanced}
          advancedDefaults={f.advancedDefaults}
          onApplyAdvanced={f.applyAdvanced}
          isFilterModalOpen={f.isFilterModalOpen}
          setIsFilterModalOpen={f.setIsFilterModalOpen}
          actions={[
            {
              label: "Nouveau connecteur",
              icon: <Plus size={13} strokeWidth={2.5} />,
              onClick: openCreate,
            },
          ]}
        />
      </div>

      {vm.isLoading ? (
        <div className="py-20">
          <PageLoader />
        </div>
      ) : (
      <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden">
        {vm.connectors.length === 0 ? (
          <div className="p-20 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#F7F8F9] flex items-center justify-center mb-6">
              <Plug size={32} className="text-[#B8CDD8] opacity-50" />
            </div>
            <h3 className="text-[17px] font-bold text-[#0D2137]">
              Aucun connecteur
            </h3>
            <p className="text-[13.5px] text-[#8BAFC0] mt-2 mb-8 max-w-85">
              Créez un connecteur technique (Orange, MTN, Twilio, Meta) pour
              permettre l'envoi des messages depuis ce produit.
            </p>
            <Button variant="primary" size="sm" onClick={openCreate}>
              <Plus size={14} className="mr-2" /> Créer maintenant
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-[#F3F4F6]">
            {vm.connectors.map((pc) => (
              <div
                key={pc.id}
                className="flex items-center justify-between px-6 py-5 hover:bg-[#FBFBFC]/50 transition-all group"
              >
                <div className="flex items-center gap-5">
                  <div className="w-11 h-11 rounded-[12px] bg-[#F7F8F9] border border-[#E5E7EB] flex items-center justify-center shrink-0 group-hover:bg-white group-hover:scale-105 transition-all">
                    <Plug size={20} className="text-[#4A7A94]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-[14.5px] font-bold text-[#0D2137]">
                        {pc.name || "Sans nom"}
                      </p>
                      {pc.isDefault && (
                        <span className="text-[9.5px] font-semibold px-2 py-0.5 rounded-full bg-[#E8F4F8] text-[#1B5E82] border border-[#6AB8D4]/30">
                          Défaut
                        </span>
                      )}
                      <Badge
                        variant={pc.isActive ? "success" : "neutral"}
                        className="text-[9.5px] font-bold uppercase tracking-wider px-2 shadow-none border-none py-0.5"
                      >
                        {pc.isActive ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                    <p className="text-[11.5px] text-[#8BAFC0] mt-1">
                      {pc.providerName || pc.providerCode || "Provider"} · Priorité{" "}
                      {pc.priority ?? "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right border-r border-[#F3F4F6] pr-8 hidden md:block">
                    <p className="text-[9.5px] text-[#8BAFC0] uppercase tracking-[0.1em] font-bold mb-1">
                      Dernier test
                    </p>
                    <div className="flex items-center gap-2 justify-end">
                      <div
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          pc.lastTestStatus === "success"
                            ? "bg-[#16A34A]"
                            : "bg-[#DC2626]",
                        )}
                      ></div>
                      <span className="text-[12.5px] text-[#0D2137] font-medium">
                        {pc.lastTestAt
                          ? formatRelative(pc.lastTestAt)
                          : "Inconnu"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setConfigureId(pc.id ?? null);
                        setConfigureName(pc.name ?? "");
                      }}
                      className="flex items-center gap-1 text-[12px] px-2.5 py-1 rounded-full border border-[#E5E7EB] hover:bg-[#E8F4F8] hover:border-[#2E8FAD]/30 hover:text-[#2E8FAD] transition-all text-[#8BAFC0] cursor-pointer"
                    >
                      <Settings size={11} />
                      Configurer
                    </button>
                    <button
                      onClick={() => openEdit(pc)}
                      title="Modifier le connecteur"
                      className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[#8BAFC0] hover:text-[#2E8FAD] hover:bg-[#E8F4F8] transition-all cursor-pointer border border-transparent hover:border-[#2E8FAD]/20 active:scale-95"
                    >
                      <Edit size={15} />
                    </button>
                    <button
                      onClick={() =>
                        pc.id && deleteMutation.mutate({ path: { id: pc.id } })
                      }
                      title="Supprimer le connecteur"
                      className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[#8BAFC0] hover:text-[#DC2626] hover:bg-[#FEE2E2] transition-all cursor-pointer border border-transparent hover:border-[#DC2626]/20 active:scale-95"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      <ConnectorFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        editing={editing}
        lockedProductId={productId}
      />

      <ConnectorConfigModal
        connectorId={configureId}
        connectorName={configureName}
        onClose={() => setConfigureId(null)}
      />
    </div>
  );
}
