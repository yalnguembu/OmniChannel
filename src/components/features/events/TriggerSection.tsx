import { useState } from "react";
import { Plus, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useEventTriggers } from "@/hooks/useEventTriggers";
import { TriggerBuilder } from "./builders/TriggerBuilder";
import type { EventDefinitionDto, EventEngineMetadataResponse } from "@/shared/api/generated/types.gen";

interface TriggerSectionProps {
  event: EventDefinitionDto;
  metadata?: EventEngineMetadataResponse;
  onValidateCondition?: (data: any) => Promise<any>;
}

export function TriggerSection({ event, metadata, onValidateCondition }: TriggerSectionProps) {
  const { triggers, isLoading, createTrigger, updateTrigger, deleteTrigger } = useEventTriggers(event.id);
  const [editingTriggerId, setEditingTriggerId] = useState<string | "new" | null>(null);

  if (editingTriggerId === "new") {
    return (
      <div className="border border-[#E5E7EB] rounded-lg bg-white p-4">
        <TriggerBuilder
          event={event}
          metadata={metadata}
          onValidateCondition={onValidateCondition}
          onSave={async (data) => {
            await createTrigger({ body: { eventDefinitionId: event.id!, ...data } });
            setEditingTriggerId(null);
          }}
          onCancel={() => setEditingTriggerId(null)}
        />
      </div>
    );
  }

  const editingTrigger = triggers.find((t) => t.id === editingTriggerId);
  if (editingTrigger) {
    return (
      <div className="border border-[#E5E7EB] rounded-lg bg-white p-4">
        <TriggerBuilder
          event={event}
          trigger={editingTrigger}
          metadata={metadata}
          onValidateCondition={onValidateCondition}
          onSave={async (data) => {
            await updateTrigger({ body: { id: editingTrigger.id, eventDefinitionId: event.id!, ...data } });
            setEditingTriggerId(null);
          }}
          onCancel={() => setEditingTriggerId(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {isLoading && <p className="text-[13px] text-[#8BAFC0]">Chargement des triggers...</p>}
      
      {!isLoading && triggers.length === 0 && (
        <p className="text-[13px] text-[#8BAFC0] text-center py-2">
          Aucun trigger configuré pour cet événement.
        </p>
      )}

      {triggers.map((trigger) => (
        <div
          key={trigger.id}
          className="flex items-center justify-between border border-[#E5E7EB] bg-white rounded-md p-3"
        >
          <div>
            <div className="flex items-center gap-2">
              <h5 className="text-[13px] font-semibold text-[#0D2137]">
                {trigger.name || "Trigger sans nom"}
              </h5>
              {!trigger.isActive && (
                <span className="shrink-0 rounded-full bg-[#FEF3C7] px-1.5 py-0.5 text-[10px] text-[#D97706]">
                  Inactif
                </span>
              )}
            </div>
            <p className="text-[12px] text-[#8BAFC0]">Priorité : {trigger.priority}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setEditingTriggerId(trigger.id!)}>
              <Edit size={14} />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => deleteTrigger({ path: { id: trigger.id! } })}>
              <Trash2 size={14} className="text-red-500" />
            </Button>
          </div>
        </div>
      ))}

      <Button variant="secondary" size="sm" onClick={() => setEditingTriggerId("new")}>
        <Plus size={13} />
        Ajouter un trigger
      </Button>
    </div>
  );
}
