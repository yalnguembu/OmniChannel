import { useState } from "react";
import { Plus, Trash2, Clock, Layers, Loader2, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useCampaignSteps } from "@/hooks/useCampaignSteps";
import { cn } from "@/lib/utils";

interface StepSequenceProps {
  campaignId?: string;
  channels: any[];
  templates: any[];
  templatesLoading: boolean;
}

const emptyForm = {
  name: "",
  channelId: "",
  templateId: "",
  delayInMinutes: 0,
};

export function StepSequence({
  campaignId,
  channels,
  templates,
  templatesLoading,
}: StepSequenceProps) {
  const { campaignSteps, isLoading, handleAdd, handleDelete, isActionPending } =
    useCampaignSteps(campaignId || "");

  const [form, setForm] = useState(emptyForm);

  if (!campaignId) {
    return (
      <div className="bg-white p-10 rounded-[24px] border border-[#E5E7EB] text-center">
        <p className="text-[14px] text-[#8BAFC0]">
          Enregistrez d'abord les informations de la campagne pour configurer la
          séquence.
        </p>
      </div>
    );
  }

  const ordered = [...campaignSteps].sort(
    (a: any, b: any) => (a.stepOrder ?? 0) - (b.stepOrder ?? 0),
  );

  const channelName = (id?: string | null) =>
    channels.find((c: any) => c.id === id)?.name ?? "Canal";
  const templateName = (id?: string | null) =>
    templates.find((t: any) => t.id === id)?.name ?? "Aucun template";

  const canAdd = form.name.trim().length > 0 && !!form.channelId;

  const onAdd = () => {
    if (!canAdd) return;
    handleAdd({
      name: form.name.trim(),
      channelId: form.channelId || null,
      templateId: form.templateId || null,
      delayInMinutes: Number(form.delayInMinutes) || 0,
      stepOrder: ordered.length + 1,
    });
    setForm(emptyForm);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-400">
      <div>
        <h2 className="text-[17px] font-bold text-[#0D2137]">
          Séquence d'envoi
        </h2>
        <p className="text-[13px] text-[#8BAFC0] mt-0.5">
          Orchestrez les étapes automatiques de diffusion (canal, template,
          délai).
        </p>
      </div>

      {/* Existing steps */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-[#2E8FAD]" size={28} />
        </div>
      ) : ordered.length === 0 ? (
        <div className="bg-[#F7F8F9] border border-dashed border-[#E5E7EB] rounded-[22px] p-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-white border border-[#E5E7EB] flex items-center justify-center mx-auto mb-3 text-[#8BAFC0]">
            <Layers size={22} />
          </div>
          <p className="text-[14px] font-bold text-[#0D2137]">
            Aucune étape configurée
          </p>
          <p className="text-[12.5px] text-[#8BAFC0] mt-1">
            Ajoutez une première étape pour démarrer la séquence.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {ordered.map((s: any, i: number) => (
            <div key={s.id}>
              <div className="bg-white border border-[#E5E7EB] rounded-[18px] p-4 flex items-center gap-4 group">
                <div className="w-9 h-9 rounded-full bg-[#0D2137] text-white flex items-center justify-center text-[12px] font-bold shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-[#0D2137] truncate">
                    {s.name || `Étape ${i + 1}`}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#2E8FAD] bg-[#E8F4F8] px-2 py-0.5 rounded-full">
                      {channelName(s.channelId)}
                    </span>
                    <span className="text-[11.5px] text-[#8BAFC0]">
                      {templateName(s.templateId)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[12px] text-[#8BAFC0] shrink-0">
                  <Clock size={13} />
                  {s.delayInMinutes ? `+${s.delayInMinutes} min` : "Immédiat"}
                </div>
                <button
                  onClick={() => handleDelete(s.id)}
                  disabled={isActionPending}
                  className="p-2 text-[#EF4444] hover:bg-[#FEF2F2] rounded-xl transition-all opacity-0 group-hover:opacity-100 disabled:opacity-40"
                  title="Supprimer l'étape"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              {i < ordered.length - 1 && (
                <div className="flex justify-center py-1">
                  <ArrowDown size={14} className="text-[#B8CDD8]" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add step form */}
      <div className="bg-[#FAFBFC] border border-[#E5E7EB] rounded-[22px] p-6 space-y-4">
        <p className="text-[13px] font-bold text-[#0D2137]">
          Ajouter une étape
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nom de l'étape"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="ex : Relance J+2"
          />
          <Input
            label="Délai (minutes)"
            type="number"
            min={0}
            value={String(form.delayInMinutes)}
            onChange={(e) =>
              setForm({ ...form, delayInMinutes: Number(e.target.value) })
            }
            placeholder="0"
          />
          <Select
            label="Canal"
            value={form.channelId}
            onChange={(e) =>
              setForm({
                ...form,
                channelId: (e.target as HTMLSelectElement).value,
              })
            }
            options={[
              { value: "", label: "Sélectionner un canal…" },
              ...channels.map((c: any) => ({ value: c.id, label: c.name })),
            ]}
          />
          {templatesLoading ? (
            <div className="flex items-end pb-2">
              <Loader2 className="animate-spin text-[#2E8FAD]" size={18} />
            </div>
          ) : (
            <Select
              label="Template"
              value={form.templateId}
              onChange={(e) =>
                setForm({
                  ...form,
                  templateId: (e.target as HTMLSelectElement).value,
                })
              }
              options={[
                { value: "", label: "Aucun template" },
                ...templates.map((t: any) => ({ value: t.id, label: t.name })),
              ]}
            />
          )}
        </div>
        <div className="flex justify-end">
          <Button
            variant="primary"
            size="sm"
            onClick={onAdd}
            disabled={!canAdd}
            loading={isActionPending}
            className="font-bold"
          >
            <Plus size={14} className={cn("mr-1.5")} />
            Ajouter l'étape
          </Button>
        </div>
      </div>
    </div>
  );
}
