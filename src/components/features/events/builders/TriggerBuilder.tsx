import { useState, useMemo } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConditionNodeEditor } from "@/components/features/contacts/ConditionNodeEditor";
import { Toggle } from "@/components/ui/Toggle";
import { useTriggerCriteria } from "@/hooks/useTriggerCriteria";
import type { TriggerDto, EventDefinitionDto, EventEngineMetadataResponse } from "@/shared/api/generated/types.gen";
import type { CriteriaAttribute } from "@/hooks/useSegmentCriteria";

interface TriggerBuilderProps {
  event: EventDefinitionDto;
  trigger?: TriggerDto;
  metadata?: EventEngineMetadataResponse;
  onValidateCondition?: (data: any) => Promise<any>;
  onSave: (data: Partial<TriggerDto>) => Promise<void>;
  onCancel: () => void;
}

export function TriggerBuilder({ event, trigger, metadata, onValidateCondition, onSave, onCancel }: TriggerBuilderProps) {
  const [name, setName] = useState(trigger?.name || "");
  const [priority, setPriority] = useState<number>(trigger?.priority ?? 10);
  const [isActive, setIsActive] = useState(trigger?.isActive ?? true);
  const [isSaving, setIsSaving] = useState(false);

  const vm = useTriggerCriteria(metadata, trigger?.conditionJson);

  // Générer les attributs sélectionnables (payload et capture)
  const attributes = useMemo<CriteriaAttribute[]>(() => {
    const list: CriteriaAttribute[] = [];
    
    // Injecter les variables capturées
    try {
      if (event.captureSpec) {
        const spec = JSON.parse(event.captureSpec);
        spec.captures?.forEach((c: any) => {
          if (c.name) {
            list.push({
              key: `capture.${c.name}`,
              label: `Capture: ${c.name}`,
              type: c.resultType || "Text",
              isNative: false,
            });
          }
        });
      }
    } catch {
      // Ignorer les erreurs de parsing
    }

    // Injecter des attributs par défaut (on pourrait aussi parser payloadSchema)
    list.push({ key: "payload.amount", label: "Payload: amount", type: "Decimal", isNative: false });
    list.push({ key: "payload.status", label: "Payload: status", type: "String", isNative: false });

    return list;
  }, [event.captureSpec]);

  const attributeByKey = (key: string) => attributes.find((a) => a.key === key);

  // Le viewmodel complet pour le ConditionNodeEditor
  const editorVm = {
    ...vm,
    attributes,
    attributeByKey,
  };

  const buildWire = (node: any): any => {
    // Basic wire builder just returning the raw tree for now.
    // In a real implementation, we should use the same precedence logic as useSegmentCriteria.
    return node;
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const conditionJson = JSON.stringify(buildWire(vm.criteria));

      if (onValidateCondition) {
        const valRes = await onValidateCondition({
          body: { conditionJson }
        });
        if (valRes?.data?.isValid === false) {
          // Gérer l'erreur de validation (affichage via toast géré dans le hook)
          // return; // Décommenter pour bloquer la sauvegarde
        }
      }

      await onSave({
        name,
        priority,
        isActive,
        conditionJson,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            label="Nom du Trigger *"
            placeholder="ex: Montant > 1000"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="w-24">
          <Input
            label="Priorité"
            type="number"
            value={priority.toString()}
            onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-md border border-[#E5E7EB] bg-[#F7F8F9] p-3 w-fit gap-6">
        <span className="text-[13px] text-[#0D2137]">Trigger actif</span>
        <Toggle checked={isActive} onChange={setIsActive} />
      </div>

      <div className="border border-[#E5E7EB] rounded-lg bg-[#F9FAFB] p-4">
        <h4 className="text-[13px] font-semibold text-[#0D2137] mb-3">
          Conditions (Criteria)
        </h4>
        <ConditionNodeEditor node={vm.criteria} path={[]} vm={editorVm as any} />
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-[#E5E7EB]">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={isSaving}>
          Annuler
        </Button>
        <Button variant="primary" size="sm" onClick={handleSave} loading={isSaving}>
          <Save size={13} />
          {trigger ? "Mettre à jour le trigger" : "Créer le trigger"}
        </Button>
      </div>
    </div>
  );
}
