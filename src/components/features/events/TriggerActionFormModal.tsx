import { Modal } from "@/components/ui/Modal";
import { TriggerActionBuilder } from "./builders/TriggerActionBuilder";
import type { TriggerActionDto } from "@/shared/api/generated/types.gen";

interface TriggerActionFormModalProps {
  open: boolean;
  onClose: () => void;
  action?: TriggerActionDto;
  productId?: string;
  onSave: (data: Partial<TriggerActionDto>) => Promise<void>;
}

export function TriggerActionFormModal({
  open,
  onClose,
  action,
  productId,
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
        productId={productId}
        onSave={async (data) => {
          await onSave(data);
          onClose();
        }}
        onCancel={onClose}
      />
    </Modal>
  );
}
