import { Modal } from "@/components/ui/Modal";
import { TriggerBuilder } from "./builders/TriggerBuilder";
import type {
  TriggerDto,
  EventDefinitionDto,
  EventEngineMetadataResponse,
} from "@/shared/api/generated/types.gen";

interface TriggerFormModalProps {
  open: boolean;
  onClose: () => void;
  event: EventDefinitionDto;
  trigger?: TriggerDto;
  metadata?: EventEngineMetadataResponse;
  onValidateCondition?: (data: any) => Promise<any>;
  onSave: (data: Partial<TriggerDto>) => Promise<void>;
}

export function TriggerFormModal({
  open,
  onClose,
  event,
  trigger,
  metadata,
  onValidateCondition,
  onSave,
}: TriggerFormModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={trigger ? `Modifier ${trigger.name || "le trigger"}` : "Nouveau trigger"}
      size="lg"
    >
      <TriggerBuilder
        event={event}
        trigger={trigger}
        metadata={metadata}
        onValidateCondition={onValidateCondition}
        onSave={async (data) => {
          await onSave(data);
          onClose();
        }}
        onCancel={onClose}
      />
    </Modal>
  );
}
