import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  MatchRuleBuilder,
  buildMatchRule,
  type MatchRuleData,
} from "./builders/MatchRuleBuilder";
import type {
  EventDefinitionDto,
  EventEngineMetadataResponse,
} from "@/shared/api/generated/types.gen";

const emptyMatchRule: MatchRuleData = { type: "Exact", values: [] };

interface EventMatchRuleModalProps {
  open: boolean;
  onClose: () => void;
  event: EventDefinitionDto;
  metadata?: EventEngineMetadataResponse;
  onValidate?: (data: any) => Promise<any>;
  onSave: (data: any) => Promise<any>;
  isSaving?: boolean;
}

export function EventMatchRuleModal({
  open,
  onClose,
  event,
  metadata,
  onValidate,
  onSave,
  isSaving,
}: EventMatchRuleModalProps) {
  const [matchRule, setMatchRule] = useState<MatchRuleData>(emptyMatchRule);

  useEffect(() => {
    if (!open) return;
    try {
      setMatchRule(event.matchRule ? JSON.parse(event.matchRule) : emptyMatchRule);
    } catch {
      setMatchRule(emptyMatchRule);
    }
  }, [open, event.matchRule]);

  const handleSave = async () => {
    const shaped = buildMatchRule(matchRule, metadata);
    if (!shaped) {
      toast.error("Ajoutez au moins une valeur de déclenchement");
      return;
    }

    if (onValidate) {
      await onValidate({ body: { matchRule: JSON.stringify(shaped) } });
    }
    await onSave({
      body: {
        id: event.id,
        productId: event.productId,
        code: event.code,
        label: event.label,
        origin: event.origin,
        isActive: event.isActive,
        matchRule: JSON.stringify(shaped),
        captureSpec: event.captureSpec,
      },
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Règle de détection (MatchRule)"
      subtitle="Définissez la règle qui déclenchera cet événement lors de la réception d'un message."
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
      <MatchRuleBuilder value={matchRule} onChange={setMatchRule} metadata={metadata} />
    </Modal>
  );
}
