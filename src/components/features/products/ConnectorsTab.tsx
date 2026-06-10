import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Plug, Trash2, Globe, Activity } from "lucide-react";
import { toast } from "sonner";
import { postApiConnectorSearchOptions } from "@/shared/api/generated/@tanstack/react-query.gen";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Toggle } from "@/components/ui/Toggle";
import { Modal } from "@/components/ui/Modal";
import { PageLoader } from "@/components/feedback/PageLoader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { formatRelative } from "@/lib/date";
import { cn } from "@/lib/utils";
import { useProductConnectors } from "@/hooks/useProductConnectors";

interface ConnectorsTabProps {
  productId: string;
}

export function ConnectorsTab({ productId }: ConnectorsTabProps) {
  const qc = useQueryClient();
  const vm = useProductConnectors(productId);
  const [modalOpen, setModalOpen] = useState(false);

  // Global connectors for linking (kept here to keep it simple)
  const { data: allConnectors = [] } = useQuery({
    ...postApiConnectorSearchOptions({ body: { pageNumber: 1, pageSize: 100 } }),
    select: (res: any) => (res?.data?.items ?? []) as any[],
  });
  const availableConnectors = allConnectors.filter(
    (ac: any) => !vm.connectors.some((pc: any) => pc.id === ac.id),
  );

  // NOTE: the API exposes no connector write endpoint (only search/get/delete),
  // so linking/toggling a connector to a product cannot be persisted yet.
  // These actions surface an honest message rather than silently no-op.
  const UNSUPPORTED_MSG =
    "La gestion des connecteurs produit n'est pas encore disponible via l'API.";

  const linkMutation = useMutation({
    mutationFn: async (_connectorId: string) => {
      throw new Error("UNSUPPORTED");
    },
    onError: () => {
      setModalOpen(false);
      toast.info(UNSUPPORTED_MSG);
    },
  });

  const unlinkMutation = useMutation({
    mutationFn: async (_id: string) => {
      throw new Error("UNSUPPORTED");
    },
    onError: () => toast.info(UNSUPPORTED_MSG),
  });

  const toggleMutation = useMutation({
    mutationFn: async (_args: { id: string; isActive: boolean }) => {
      throw new Error("UNSUPPORTED");
    },
    onError: () => toast.info(UNSUPPORTED_MSG),
  });

  if (vm.isLoading)
    return (
      <div className="py-20">
        <PageLoader />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-1 bg-white p-5 rounded-[20px] border border-[#E5E7EB]">
        <div>
          <h3 className="text-[17px] font-bold text-[#0D2137]">
            Connecteurs techniques
          </h3>
          <p className="text-[12.5px] text-[#8BAFC0] mt-0.5">
            Passerelles techniques utilisées par ce produit
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setModalOpen(true)}
          className="gap-2 px-5"
        >
          <Plus size={14} /> Lier un connecteur
        </Button>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-[20px] overflow-hidden">
        {vm.connectors.length === 0 ? (
          <div className="p-20 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#F7F8F9] flex items-center justify-center mb-6">
              <Plug size={32} className="text-[#B8CDD8] opacity-50" />
            </div>
            <h3 className="text-[17px] font-bold text-[#0D2137]">
              Aucun connecteur
            </h3>
            <p className="text-[13.5px] text-[#8BAFC0] mt-2 mb-8 max-w-[340px]">
              Liez un connecteur technique (Orange, MTN, Twilio, Meta) pour
              permettre l'envoi des messages.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setModalOpen(true)}
            >
              <Plus size={14} className="mr-2" /> Lier maintenant
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-[#F3F4F6]">
            {vm.connectors.map((pc: any) => (
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
                        {pc.name}
                      </p>
                      <Badge
                        variant={pc.status === "active" ? "success" : "neutral"}
                        className="text-[9.5px] font-bold uppercase tracking-wider px-2 shadow-none border-none py-0.5"
                      >
                        {pc.status}
                      </Badge>
                    </div>
                    <p className="text-[11.5px] text-[#8BAFC0] mt-1 flex items-center gap-2">
                      <Globe size={12} className="text-[#B8CDD8]" />
                      <span className="font-mono text-[10.5px] truncate max-w-[250px]">
                        {pc.baseUrl || "https://api.gateway.net"}
                      </span>
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
                  <div className="flex items-center gap-3 pr-4 border-r border-[#F3F4F6]">
                    <span
                      className={cn(
                        "text-[12px] font-medium transition-colors",
                        pc.isActive ? "text-[#16A34A]" : "text-[#9CA3AF]",
                      )}
                    >
                      {pc.isActive ? "Actif" : "Vérifiez config"}
                    </span>
                    <Toggle
                      checked={pc.isActive}
                      onChange={() =>
                        toggleMutation.mutate({
                          id: pc.id,
                          isActive: !pc.isActive,
                        })
                      }
                    />
                  </div>
                  <button
                    onClick={() => unlinkMutation.mutate(pc.id)}
                    title="Délier le connecteur"
                    className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[#8BAFC0] hover:text-[#DC2626] hover:bg-[#FEE2E2] transition-all cursor-pointer border border-transparent hover:border-[#DC2626]/20 active:scale-95"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Lier un connecteur"
        subtitle="Appliquez ce connecteur à cet espace produit"
        size="md"
        footer={
          <Button variant="secondary" onClick={() => setModalOpen(false)}>
            Fermer
          </Button>
        }
      >
        <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 scrollbar-custom">
          {availableConnectors.length === 0 ? (
            <div className="py-12 text-center text-[#8BAFC0] italic">
              Tous les connecteurs disponibles sont déjà liés.
            </div>
          ) : (
            availableConnectors.map((c: any) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-4 border border-[#E5E7EB] rounded-[14px] hover:border-[#2E8FAD]/40 hover:bg-[#F7F8F9] transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-[12px] bg-[#F7F8F9] border border-[#E5E7EB] flex items-center justify-center shrink-0 group-hover:bg-white group-hover:rotate-6 transition-transform">
                    <Plug size={18} className="text-[#4A7A94]" />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-[#0D2137]">
                      {c.name}
                    </p>
                    <p className="text-[11px] text-[#8BAFC0] uppercase font-bold tracking-wider">
                      {c.status}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => linkMutation.mutate(c.id)}
                  loading={
                    linkMutation.isPending && linkMutation.variables === c.id
                  }
                  className="hover:bg-[#2E8FAD] hover:text-white"
                >
                  Lier
                </Button>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
}
