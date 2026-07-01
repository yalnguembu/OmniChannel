import { useState } from "react";
import { Edit, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTriggerActions } from "@/hooks/useTriggerActions";
import { TriggerActionFormModal } from "./TriggerActionFormModal";
import { actionTypeLabel } from "./actionTypes";
import type { TriggerActionDto, TriggerDto } from "@/shared/api/generated/types.gen";

interface EventTriggerCardProps {
  trigger: TriggerDto;
  onEdit: () => void;
  onDelete: () => void;
}

export function EventTriggerCard({ trigger, onEdit, onDelete }: EventTriggerCardProps) {
  const { actions, isLoading, createAction, updateAction, deleteAction } = useTriggerActions(trigger.id);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<TriggerActionDto | null>(null);

  const openCreateAction = () => {
    setEditingAction(null);
    setActionModalOpen(true);
  };
  const openEditAction = (action: TriggerActionDto) => {
    setEditingAction(action);
    setActionModalOpen(true);
  };

  const handleSaveAction = async (data: Partial<TriggerActionDto>) => {
    if (editingAction) {
      await updateAction({ body: { id: editingAction.id, triggerId: trigger.id, ...data } });
    } else {
      await createAction({ body: { triggerId: trigger.id!, ...data } });
    }
  };

  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h5 className="text-[13.5px] font-semibold text-[#0D2137]">
            {trigger.name || "Trigger sans nom"}
          </h5>
          {!trigger.isActive && (
            <span className="shrink-0 rounded-full bg-[#FEF3C7] px-1.5 py-0.5 text-[10px] text-[#D97706]">
              Inactif
            </span>
          )}
          <span className="text-[11px] text-[#8BAFC0]">Priorité : {trigger.priority}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Edit size={14} />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Trash2 size={14} className="text-red-500" />
          </Button>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <h6 className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#8BAFC0]">
          Actions
        </h6>

        {isLoading && <p className="text-[12px] text-[#8BAFC0]">Chargement…</p>}

        {!isLoading && actions.length === 0 && (
          <p className="text-[12px] text-[#8BAFC0] text-center py-2 border border-dashed border-[#E5E7EB] rounded-md">
            Aucune action configurée.
          </p>
        )}

        {actions.map((action) => (
          <div
            key={action.id}
            className="flex items-center justify-between border border-[#E5E7EB] bg-white rounded-md p-2.5"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F0F2F4] text-[11px] font-medium text-[#4A7A94]">
                {action.orderIndex}
              </span>
              <span className="text-[12.5px] font-medium text-[#0D2137]">{actionTypeLabel(action.type)}</span>
              {action.delaySeconds ? (
                <span className="text-[11px] text-[#8BAFC0]">({action.delaySeconds}s delay)</span>
              ) : null}
              {action.continueOnError && (
                <span className="text-[10.5px] text-[#D97706]">Continue en cas d'erreur</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => openEditAction(action)}>
                <Edit size={13} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteAction({ path: { id: action.id! } })}
              >
                <Trash2 size={13} className="text-red-500" />
              </Button>
            </div>
          </div>
        ))}

        <Button variant="secondary" size="sm" onClick={openCreateAction}>
          <Plus size={12} />
          Ajouter une action
        </Button>
      </div>

      <TriggerActionFormModal
        open={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        action={editingAction ?? undefined}
        onSave={handleSaveAction}
      />
    </div>
  );
}
