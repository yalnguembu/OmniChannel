import React, { useState } from "react";
import { Plus, Radio, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Toggle } from "@/components/ui/Toggle";
import { Modal } from "@/components/ui/Modal";
import { PageLoader } from "@/components/feedback/PageLoader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { cn } from "@/lib/utils";
import { useProductChannels } from "@/hooks/useProductChannels";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiChannelDropdownOptions } from "@/shared/api/generated/@tanstack/react-query.gen";
import {
  postApiProductChannel,
  putApiProductChannel,
  deleteApiProductChannelById,
} from "@/shared/api/generated/sdk.gen";
import { toast } from "sonner";

interface ChannelsTabProps {
  productId: string;
}

export function ChannelsTab({ productId }: ChannelsTabProps) {
  const qc = useQueryClient();
  const vm = useProductChannels(productId);
  const [modalOpen, setModalOpen] = useState(false);

  // Global channels for linking (kept here as it's specific to the link modal)
  const { data: allChannels = [] } = useQuery({
    ...getApiChannelDropdownOptions(),
    select: (res: any) => (res?.data ?? []) as any[],
  });
  const availableChannels = allChannels.filter(
    (ac: any) => !vm.channels.some((pc) => pc.channelId === ac.id),
  );

  const linkMutation = useMutation({
    mutationFn: (channelId: string) =>
      postApiProductChannel({
        body: { productId, channelId, isActive: true } as any,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["product-channels", productId] });
      setModalOpen(false);
      toast.success("Canal ajouté au produit");
    },
    onError: () => toast.error("Erreur lors de l’ajout"),
  });

  const unlinkMutation = useMutation({
    mutationFn: (id: string) => deleteApiProductChannelById({ path: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["product-channels", productId] });
      toast.success("Canal retiré");
    },
    onError: () => toast.error("Erreur lors du retrait"),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      putApiProductChannel({ body: { id, isActive } as any }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["product-channels", productId] }),
  });

  if (vm.isLoading)
    return (
      <div className="py-20">
        <PageLoader />
      </div>
    );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between pb-1">
        <div>
          <h3 className="text-[16px] font-semibold text-[#0D2137]">
            Canaux de communication
          </h3>
          <p className="text-[12.5px] text-[#8BAFC0]">
            Gérez les passerelles actives pour ce produit
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setModalOpen(true)}
          className="gap-1.5"
        >
          <Plus size={13} /> Associer un canal
        </Button>
      </div>

      <div className="bg-white border border-[#E5E7EB] rounded-[14px] overflow-hidden">
        {vm.channels.length === 0 ? (
          <div className="p-20">
            <EmptyState
              icon={<Radio size={48} className="text-[#B8CDD8]" />}
              title="Aucun canal associé"
              description="Ce produit ne peut pas diffuser de messages tant qu'un canal (SMS, Email, WhatsApp) n'est pas configuré."
              action={
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setModalOpen(true)}
                  className="mt-4"
                >
                  <Plus size={16} className="mr-2" /> Associer maintenant
                </Button>
              }
            />
          </div>
        ) : (
          <div className="divide-y divide-[#F3F4F6]">
            {vm.channels.map((pc) => {
              const ch = allChannels.find((c: any) => c.id === pc.channelId);
              return (
                <div
                  key={pc.id}
                  className="flex items-center justify-between px-6 py-5 hover:bg-[#FBFBFC] transition-all group"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-[14px] bg-[#E8F4F8] border border-[#2E8FAD]/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Radio size={22} className="text-[#2E8FAD]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-[15px] font-bold text-[#0D2137]">
                          {ch?.name || "Canal inconnu"}
                        </p>
                        <Badge
                          variant={
                            ch?.type === "sms"
                              ? "success"
                              : ch?.type === "email"
                                ? "warning"
                                : "neutral"
                          }
                          className="text-[10px] font-bold uppercase tracking-wider px-2 shadow-none border-none"
                        >
                          {ch?.type || "Standard"}
                        </Badge>
                      </div>
                      <p className="text-[11.5px] text-[#8BAFC0] mt-1 font-mono uppercase tracking-wider">
                        ID: {ch?.id.slice(0, 8)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 pr-5 border-r border-[#F3F4F6]">
                      <span
                        className={cn(
                          "text-[12px] font-medium transition-colors",
                          pc.isActive ? "text-[#16A34A]" : "text-[#9CA3AF]",
                        )}
                      >
                        {pc.isActive ? "Opérationnel" : "Désactivé"}
                      </span>
                      <Toggle
                        checked={!!pc.isActive}
                        onChange={() =>
                          toggleMutation.mutate({
                            id: pc.id ?? "",
                            isActive: !pc.isActive,
                          })
                        }
                      />
                    </div>
                    <button
                      onClick={() => unlinkMutation.mutate(pc.id ?? "")}
                      title="Retirer le canal"
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8BAFC0] hover:text-[#DC2626] hover:bg-[#FEE2E2] transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Associer des canaux"
        subtitle="Activez les canaux de communication pour cet espace produit"
        size="md"
        footer={
          <Button variant="secondary" onClick={() => setModalOpen(false)}>
            Fermer
          </Button>
        }
      >
        <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 scrollbar-custom">
          {availableChannels.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-[13.5px] text-[#8BAFC0] italic font-medium">
                Tous les canaux globaux sont déjà actifs sur ce produit.
              </p>
            </div>
          ) : (
            availableChannels.map((ch: any) => (
              <div
                key={ch.id}
                className="flex items-center justify-between p-4 border border-[#E5E7EB] rounded-[14px] hover:border-[#2E8FAD]/40 hover:bg-[#F7F8F9] transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-[12px] bg-[#E8F4F8] flex items-center justify-center shrink-0 border border-black/5 group-hover:rotate-6 transition-transform">
                    <Radio size={18} className="text-[#2E8FAD]" />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-[#0D2137]">
                      {ch.name}
                    </p>
                    <p className="text-[11px] text-[#8BAFC0] uppercase font-bold tracking-wider">
                      {ch.type}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => linkMutation.mutate(ch.id)}
                  loading={
                    linkMutation.isPending && linkMutation.variables === ch.id
                  }
                  className="hover:bg-[#2E8FAD] hover:text-white"
                >
                  Ajouter
                </Button>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
}
