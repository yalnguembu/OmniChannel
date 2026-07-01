import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  CaptureSpecBuilder,
  buildCaptureSpec,
  type CaptureSpecData,
} from "./builders/CaptureSpecBuilder";
import type { EventDefinitionDto } from "@/shared/api/generated/types.gen";

const emptyCaptureSpec: CaptureSpecData = { captures: [] };

interface EventCaptureSpecModalProps {
  open: boolean;
  onClose: () => void;
  event: EventDefinitionDto;
  onSave: (data: any) => Promise<any>;
  isSaving?: boolean;
}

export function EventCaptureSpecModal({
  open,
  onClose,
  event,
  onSave,
  isSaving,
}: EventCaptureSpecModalProps) {
  const [captureSpec, setCaptureSpec] = useState<CaptureSpecData>(emptyCaptureSpec);

  useEffect(() => {
    if (!open) return;
    try {
      setCaptureSpec(event.captureSpec ? JSON.parse(event.captureSpec) : emptyCaptureSpec);
    } catch {
      setCaptureSpec(emptyCaptureSpec);
    }
  }, [open, event.captureSpec]);

  const handleSave = async () => {
    await onSave({
      body: {
        id: event.id,
        productId: event.productId,
        code: event.code,
        label: event.label,
        origin: event.origin,
        isActive: event.isActive,
        matchRule: event.matchRule,
        captureSpec: JSON.stringify(buildCaptureSpec(captureSpec) ?? { captures: [] }),
      },
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Extractions (CaptureSpec)"
      subtitle="Configurez les extractions de données depuis le message ou l'historique."
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSave} loading={isSaving}>
            Enregistrer
          </Button>
        </>
      }
    >
      <CaptureSpecBuilder value={captureSpec} onChange={setCaptureSpec} />
    </Modal>
  );
}
