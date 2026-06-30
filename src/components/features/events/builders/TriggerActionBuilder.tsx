import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { TriggerActionDto } from "@/shared/api/generated/types.gen";

interface TriggerActionBuilderProps {
  action?: TriggerActionDto;
  onSave: (data: Partial<TriggerActionDto>) => Promise<void>;
  onCancel: () => void;
}

export function TriggerActionBuilder({ action, onSave, onCancel }: TriggerActionBuilderProps) {
  const [type, setType] = useState(action?.type || "UpdateClient");
  const [configJson, setConfigJson] = useState(action?.configJson || "{}");
  const [orderIndex, setOrderIndex] = useState(action?.orderIndex ?? 10);
  const [delaySeconds, setDelaySeconds] = useState(action?.delaySeconds ?? 0);
  const [continueOnError, setContinueOnError] = useState(action?.continueOnError ?? false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave({
        type,
        configJson,
        orderIndex,
        delaySeconds: delaySeconds || null,
        continueOnError,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Type d'action"
          value={type}
          onChange={(e) => setType(e.target.value)}
          options={[
            { value: "UpdateClient", label: "Mettre à jour le client" },
            { value: "SendMessage", label: "Envoyer un message" },
            { value: "TagClient", label: "Taguer le client" },
            { value: "TransferToAgent", label: "Transférer à un agent" },
            { value: "UpdateStatus", label: "Mettre à jour le statut" },
          ]}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Ordre d'exécution"
            type="number"
            value={orderIndex.toString()}
            onChange={(e) => setOrderIndex(parseInt(e.target.value) || 0)}
          />
          <Input
            label="Délai (secondes)"
            type="number"
            value={delaySeconds.toString()}
            onChange={(e) => setDelaySeconds(parseInt(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="border border-[#E5E7EB] rounded-lg p-4 bg-white">
        <h4 className="text-[13px] font-semibold text-[#0D2137] mb-3">
          Configuration de l'action (JSON)
        </h4>
        <textarea
          className="w-full h-32 p-3 text-[13px] font-mono border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#4A7A94]"
          value={configJson}
          onChange={(e) => setConfigJson(e.target.value)}
          placeholder='{"key": "value"}'
        />
      </div>

      <label className="flex w-fit items-center gap-2 text-[12.5px] text-[#4A7A94] cursor-pointer">
        <input
          type="checkbox"
          checked={continueOnError}
          onChange={(e) => setContinueOnError(e.target.checked)}
          className="rounded"
        />
        Continuer en cas d'erreur
      </label>

      <div className="flex justify-end gap-2 pt-2 border-t border-[#E5E7EB]">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={isSaving}>
          Annuler
        </Button>
        <Button variant="primary" size="sm" onClick={handleSave} loading={isSaving}>
          <Save size={13} />
          {action ? "Mettre à jour l'action" : "Créer l'action"}
        </Button>
      </div>
    </div>
  );
}
