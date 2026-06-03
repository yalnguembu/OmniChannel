import React from "react";
import { Settings2, Trash2, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { PrioritySelector } from "@/components/ui/PrioritySelector";
import { cn } from "@/lib/utils";

export function StepChannels({
  draft,
  updateDraft,
  channels,
  configuringChannelId,
  setConfiguringChannelId,
  templates,
  templatesLoading,
  syncChannelMutation,
  setShowNewTemplateModal,
}: {
  draft: any;
  updateDraft: (data: any) => void;
  channels: any[];
  configuringChannelId: string | null;
  setConfiguringChannelId: (id: string | null) => void;
  templates: any[];
  templatesLoading: boolean;
  syncChannelMutation: any;
  setShowNewTemplateModal: (show: boolean) => void;
}) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-400">
      <div className="flex items-center justify-between">
        <h2 className="text-[17px] font-bold text-[#0D2137]">
          Canaux & Contenus
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {channels.map((ch: any) => {
          const sel = draft.channelIds?.includes(ch.id);
          const isConfig = configuringChannelId === ch.id;
          return (
            <div
              key={ch.id}
              className={cn(
                "bg-white border rounded-[22px] transition-all overflow-hidden",
                sel
                  ? "border-[#2E8FAD] shadow-md shadow-[#2E8FAD]/5"
                  : "border-[#E5E7EB]",
                isConfig && "ring-2 ring-[#0D2137]/10",
              )}
            >
              <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-11 h-11 rounded-2xl flex items-center justify-center",
                      sel
                        ? "bg-[#2E8FAD] text-white"
                        : "bg-[#F3F4F6] text-[#8BAFC0]",
                    )}
                  >
                    <Settings2 size={20} />
                  </div>
                  <div>
                    <p className="text-[14.5px] font-bold text-[#0D2137]">
                      {ch.name}
                    </p>
                    <span className="text-[10px] uppercase font-bold text-[#8BAFC0] tracking-widest">
                      {ch.type}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {sel ? (
                    <button
                      onClick={() =>
                        syncChannelMutation.mutate({
                          channelId: ch.id,
                          action: "remove",
                        })
                      }
                      className="p-2.5 text-[#EF4444] hover:bg-[#FEF2F2] rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setConfiguringChannelId(ch.id)}
                    >
                      Configurer
                    </Button>
                  )}
                </div>
              </div>
              {isConfig && (
                <div className="p-6 pt-2 border-t border-[#F3F4F6] bg-[#FAFBFC] space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        {templatesLoading ? (
                          <Loader2 />
                        ) : (
                          <Select
                            label="Choisir un template"
                            options={templates.map((t: any) => ({
                              value: t.id,
                              label: t.name,
                            }))}
                            value={draft.templateIds?.[ch.id] || ""}
                            onChange={(e) =>
                              updateDraft({
                                templateIds: {
                                  ...draft.templateIds,
                                  [ch.id]: (e.target as HTMLSelectElement).value,
                                },
                              })
                            }
                          />
                        )}
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-10 mb-[2px] px-3 font-bold bg-white"
                        onClick={() => setShowNewTemplateModal(true)}
                      >
                        <Plus size={14} className="mr-1.5" /> Nouveau
                      </Button>
                    </div>
                  </div>
                  <PrioritySelector
                    value={draft.priorities?.[ch.id] || 1}
                    onChange={(v) =>
                      updateDraft({
                        priorities: { ...draft.priorities, [ch.id]: v },
                      })
                    }
                  />
                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfiguringChannelId(null)}
                    >
                      Fermer
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() =>
                        syncChannelMutation.mutate({
                          channelId: ch.id,
                          action: "add",
                          templateId: draft.templateIds?.[ch.id],
                          priority: draft.priorities?.[ch.id] || 1,
                        })
                      }
                    >
                      Lier le canal
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
