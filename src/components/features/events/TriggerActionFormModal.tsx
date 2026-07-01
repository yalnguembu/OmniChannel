import { Modal } from "@/components/ui/Modal";
import { TriggerActionBuilder } from "./builders/TriggerActionBuilder";
import type { TriggerActionDto } from "@/shared/api/generated/types.gen";

interface TriggerActionFormModalProps {
  open: boolean;
  onClose: () => void;
  action?: TriggerActionDto;
  onSave: (data: Partial<TriggerActionDto>) => Promise<void>;
}

export function TriggerActionFormModal({
  open,
  onClose,
  action,
  onSave,
}: TriggerActionFormModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={action ? "Modifier l'action" : "Nouvelle action"}
      size="md"
    >
      <TriggerActionBuilder
        action={action}
        onSave={async (data) => {
          await onSave(data);
          onClose();
        }}
        onCancel={onClose}
      />
    </Modal>
  );
}
