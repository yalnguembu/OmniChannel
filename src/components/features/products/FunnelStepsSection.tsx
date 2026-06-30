import { useState } from "react";
import { Plus, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useFunnelSteps } from "@/hooks/useFunnelSteps";
import { useQuery } from "@tanstack/react-query";
import { postApiEventDefinitionSearchOptions } from "@/shared/api/generated/@tanstack/react-query.gen";
import type { EventFunnelStepDto } from "@/shared/api/generated/types.gen";

interface FunnelStepsSectionProps {
  funnelId: string;
  productId: string;
}

export function FunnelStepsSection({ funnelId, productId }: FunnelStepsSectionProps) {
  const { steps, isLoading, createStep, updateStep, deleteStep } = useFunnelSteps(funnelId);
  const [editingStepId, setEditingStepId] = useState<string | "new" | null>(null);

  // Fetch events for the dropdown
  const { data: events = [] } = useQuery({
    ...postApiEventDefinitionSearchOptions({
      body: { productId, pageSize: 100 } as any,
    }),
    select: (res) => (res?.data?.items ?? []),
  });

  const StepForm = ({ step, onSave, onCancel }: { step?: EventFunnelStepDto, onSave: (d: Partial<EventFunnelStepDto>) => void, onCancel: () => void }) => {
    const [label, setLabel] = useState(step?.label || "");
    const [orderIndex, setOrderIndex] = useState(step?.orderIndex ?? 10);
    const [eventDefinitionId, setEventDefinitionId] = useState(step?.eventDefinitionId || "");

    return (
      <div className="border border-[#E5E7EB] bg-[#F9FAFB] p-4 rounded-md space-y-3 mt-3">
        <div className="grid grid-cols-2 gap-3">
          <Input 
            label="Nom de l'étape" 
            value={label} 
            onChange={(e) => setLabel(e.target.value)} 
            placeholder="ex: Inscription" 
          />
          <Input 
            label="Ordre" 
            type="number" 
            value={orderIndex.toString()} 
            onChange={(e) => setOrderIndex(parseInt(e.target.value) || 0)} 
          />
        </div>
        <Select
          label="Événement associé"
          value={eventDefinitionId}
          onChange={(e) => setEventDefinitionId(e.target.value)}
          options={[
            { value: "", label: "Sélectionner un événement..." },
            ...events.map(ev => ({ value: ev.id as string, label: ev.label || ev.code || "Sans nom" }))
          ]}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>Annuler</Button>
          <Button variant="primary" size="sm" onClick={() => onSave({ label, orderIndex, eventDefinitionId })}>
            Enregistrer l'étape
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-[14px] font-semibold text-[#0D2137]">Étapes du tunnel</h4>
        {editingStepId === null && (
          <Button variant="secondary" size="sm" onClick={() => setEditingStepId("new")}>
            <Plus size={13} /> Ajouter une étape
          </Button>
        )}
      </div>

      {isLoading && <p className="text-[13px] text-[#8BAFC0]">Chargement des étapes...</p>}

      {!isLoading && steps.length === 0 && editingStepId !== "new" && (
        <p className="text-[13px] text-[#8BAFC0] border border-dashed border-[#E5E7EB] p-4 rounded-md text-center">
          Aucune étape configurée.
        </p>
      )}

      {editingStepId === "new" && (
        <StepForm 
          onSave={async (data) => {
            await createStep({ body: { funnelId, ...data } });
            setEditingStepId(null);
          }} 
          onCancel={() => setEditingStepId(null)} 
        />
      )}

      <div className="space-y-2 mt-2">
        {steps.map((step) => {
          if (editingStepId === step.id) {
            return (
              <StepForm 
                key={step.id} 
                step={step} 
                onSave={async (data) => {
                  await updateStep({ body: { id: step.id, funnelId, ...data } });
                  setEditingStepId(null);
                }} 
                onCancel={() => setEditingStepId(null)} 
              />
            );
          }

          const eventName = events.find(e => e.id === step.eventDefinitionId)?.label || "Événement inconnu";

          return (
            <div key={step.id} className="flex items-center justify-between p-3 border border-[#E5E7EB] bg-white rounded-md">
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F3F4F6] text-[12px] font-semibold text-[#4A7A94]">
                  {step.orderIndex}
                </span>
                <div>
                  <h5 className="text-[13px] font-semibold text-[#0D2137]">{step.label || "Sans nom"}</h5>
                  <p className="text-[11px] text-[#8BAFC0] mt-0.5">Événement : {eventName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setEditingStepId(step.id!)}>
                  <Edit size={14} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => deleteStep({ path: { id: step.id! } })}>
                  <Trash2 size={14} className="text-red-500" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
