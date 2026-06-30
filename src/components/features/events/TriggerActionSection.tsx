import { useState } from "react";
import { Plus, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTriggerActions } from "@/hooks/useTriggerActions";
import { TriggerActionBuilder } from "./builders/TriggerActionBuilder";
import type { TriggerDto } from "@/shared/api/generated/types.gen";

interface TriggerActionSectionProps {
  trigger: TriggerDto;
}

export function TriggerActionSection({ trigger }: TriggerActionSectionProps) {
  const { actions, isLoading, createAction, updateAction, deleteAction } = useTriggerActions(trigger.id);
  const [editingActionId, setEditingActionId] = useState<string | "new" | null>(null);

  if (editingActionId === "new") {
    return (
      <div className="border border-[#E5E7EB] rounded-lg bg-[#F9FAFB] p-4 mt-4">
        <TriggerActionBuilder
          onSave={async (data) => {
            await createAction({ body: { triggerId: trigger.id!, ...data } });
            setEditingActionId(null);
          }}
          onCancel={() => setEditingActionId(null)}
        />
      </div>
    );
  }

  const editingAction = actions.find((a) => a.id === editingActionId);
  if (editingAction) {
    return (
      <div className="border border-[#E5E7EB] rounded-lg bg-[#F9FAFB] p-4 mt-4">
        <TriggerActionBuilder
          action={editingAction}
          onSave={async (data) => {
            await updateAction({ body: { id: editingAction.id, triggerId: trigger.id!, ...data } });
            setEditingActionId(null);
          }}
          onCancel={() => setEditingActionId(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3 mt-4">
      <h4 className="text-[14px] font-semibold text-[#0D2137]">Actions</h4>
      
      {isLoading && <p className="text-[13px] text-[#8BAFC0]">Chargement des actions...</p>}
      
      {!isLoading && actions.length === 0 && (
        <p className="text-[13px] text-[#8BAFC0] text-center py-2 border border-dashed border-[#E5E7EB] rounded-md">
          Aucune action configurée.
        </p>
      )}

      {actions.map((action) => (
        <div
          key={action.id}
          className="flex items-center justify-between border border-[#E5E7EB] bg-white rounded-md p-3"
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F0F2F4] text-[11px] font-medium text-[#4A7A94]">
                {action.orderIndex}
              </span>
              <h5 className="text-[13px] font-semibold text-[#0D2137]">
                {action.type}
              </h5>
              {action.delaySeconds ? (
                <span className="text-[11px] text-[#8BAFC0]">({action.delaySeconds}s delay)</span>
              ) : null}
            </div>
            {action.continueOnError && (
              <p className="text-[11px] text-[#D97706] mt-1">Continue en cas d'erreur</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setEditingActionId(action.id!)}>
              <Edit size={14} />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => deleteAction({ path: { id: action.id! } })}>
              <Trash2 size={14} className="text-red-500" />
            </Button>
          </div>
        </div>
      ))}

      <Button variant="secondary" size="sm" onClick={() => setEditingActionId("new")}>
        <Plus size={13} />
        Ajouter une action
      </Button>
    </div>
  );
}
