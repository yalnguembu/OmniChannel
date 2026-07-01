import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { postApiEventDefinitionSearchOptions } from "@/shared/api/generated/@tanstack/react-query.gen";
import type { EventFunnelStepDto } from "@/shared/api/generated/types.gen";
import { toast } from "sonner";

interface FunnelStepModalProps {
  open: boolean;
  onClose: () => void;
  productId: string;
  editing: EventFunnelStepDto | null;
  onSave: (data: Partial<EventFunnelStepDto>) => Promise<void>;
  isSaving?: boolean;
}

export function FunnelStepModal({
  open,
  onClose,
  productId,
  editing,
  onSave,
  isSaving,
}: FunnelStepModalProps) {
  const [label, setLabel] = useState("");
  const [orderIndex, setOrderIndex] = useState(10);
  const [eventDefinitionId, setEventDefinitionId] = useState("");

  const { data: events = [] } = useQuery({
    ...postApiEventDefinitionSearchOptions({
      body: { productId, pageSize: 100 } as any,
    }),
    select: (res) => res?.data?.items ?? [],
    enabled: open,
  });

  useEffect(() => {
    if (!open) return;
    setLabel(editing?.label || "");
    setOrderIndex(editing?.orderIndex ?? 10);
    setEventDefinitionId(editing?.eventDefinitionId || "");
  }, [open, editing]);

  const save = async () => {
    if (!eventDefinitionId) {
      toast.error("L'événement associé est requis");
      return;
    }
    await onSave({ label, orderIndex, eventDefinitionId });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Modifier l'étape" : "Nouvelle étape"}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            Annuler
          </Button>
          <Button variant="primary" onClick={save} loading={isSaving}>
            {editing ? "Enregistrer" : "Ajouter l'étape"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
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
          label="Événement associé *"
          value={eventDefinitionId}
          onChange={(e) => setEventDefinitionId(e.target.value)}
          options={[
            { value: "", label: "Sélectionner un événement..." },
            ...events.map((ev) => ({
              value: ev.id as string,
              label: ev.label || ev.code || "Sans nom",
            })),
          ]}
        />
      </div>
    </Modal>
  );
}
