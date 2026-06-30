import { useState } from "react";
import { ChevronRight, Trash2, Save, Activity } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";
import type {
  EventDefinitionDto,
  EventEngineMetadataResponse,
} from "@/shared/api/generated/types.gen";
import {
  MatchRuleBuilder,
  type MatchRuleData,
} from "./builders/MatchRuleBuilder";
import {
  CaptureSpecBuilder,
  type CaptureSpecData,
} from "./builders/CaptureSpecBuilder";
import { TriggerSection } from "./TriggerSection";

interface EventDefinitionCardProps {
  productId: string;
  event?: EventDefinitionDto;
  isNew?: boolean;
  metadata?: EventEngineMetadataResponse;
  onSaved: () => void;
  onDeleted?: () => void;
  onCancel?: () => void;
  onSaveEvent: (data: any) => Promise<any>;
  onDeleteEvent?: (id: string) => Promise<any>;
  onValidateMatchRule?: (data: any) => Promise<any>;
  onValidateCondition?: (data: any) => Promise<any>;
}

export function EventDefinitionCard({
  productId,
  event,
  isNew = false,
  metadata,
  onSaved,
  onDeleted,
  onCancel,
  onSaveEvent,
  onDeleteEvent,
  onValidateMatchRule,
  onValidateCondition,
}: EventDefinitionCardProps) {
  const [open, setOpen] = useState(isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [code, setCode] = useState(event?.code || "");
  const [label, setLabel] = useState(event?.label || "");
  const [origin, setOrigin] = useState(event?.origin || "Internal");
  const [isActive, setIsActive] = useState(event?.isActive ?? true);

  const [matchRule, setMatchRule] = useState<MatchRuleData>(() => {
    try {
      return event?.matchRule
        ? JSON.parse(event.matchRule)
        : { type: "Exact", values: [] };
    } catch {
      return { type: "Exact", values: [] };
    }
  });

  const [captureSpec, setCaptureSpec] = useState<CaptureSpecData>(() => {
    try {
      return event?.captureSpec
        ? JSON.parse(event.captureSpec)
        : { captures: [] };
    } catch {
      return { captures: [] };
    }
  });

  const isInternal = origin === "Internal";

  const handleSave = async () => {
    try {
      setIsSaving(true);

      if (isInternal && onValidateMatchRule) {
        const valRes = await onValidateMatchRule({
          body: { matchRule: JSON.stringify(matchRule) },
        });
        if (valRes?.data?.isValid === false) {
          // You could display errors here. We'll rely on the global error handler for now,
          // or we can just stop if it's invalid.
          // return;
        }
      }

      await onSaveEvent({
        body: {
          id: event?.id,
          productId,
          code,
          label,
          origin,
          isActive,
          matchRule: isInternal ? JSON.stringify(matchRule) : undefined,
          captureSpec: JSON.stringify(captureSpec),
        },
      });
      onSaved();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (event?.id && onDeleteEvent) {
      await onDeleteEvent(event.id);
      if (onDeleted) onDeleted();
    }
  };

  return (
    <div className="overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB]">
      {/* Collapsed header — always visible */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <ChevronRight
            size={15}
            className={cn(
              "shrink-0 text-[#8BAFC0] transition-transform",
              open && "rotate-90",
            )}
          />
          <span className="shrink-0 font-mono text-[12.5px] text-[#0D2137]">
            {label || "Nouvel événement"}
          </span>
          {code && (
            <span className="truncate text-[12.5px] text-[#8BAFC0]">
              · {code}
            </span>
          )}
          <span className="ml-auto shrink-0 rounded-full bg-[#F0F2F4] px-1.5 py-0.5 text-[11px] text-[#4A7A94]">
            {origin}
          </span>
          {!isActive && (
            <span className="shrink-0 rounded-full bg-[#FEF3C7] px-1.5 py-0.5 text-[10px] text-[#D97706]">
              Inactif
            </span>
          )}
        </button>
        {isNew && onCancel ? (
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Annuler
          </Button>
        ) : (
          <button
            type="button"
            onClick={handleDelete}
            className="shrink-0 p-1.5 text-[#8BAFC0] transition-colors hover:text-[#DC2626]"
            title="Supprimer l'événement"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Editor body — collapsible */}
      {open && (
        <div className="space-y-4 border-t border-[#E5E7EB] px-4 pb-4 pt-4 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              label="Code *"
              placeholder="user_signup"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <Input
              label="Libellé"
              placeholder="Inscription utilisateur"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
            <Select
              label="Origine"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              options={[
                { value: "Internal", label: "Interne (Messages WhatsApp)" },
                { value: "External", label: "Externe (Appel API HTTP)" },
              ]}
            />
          </div>

          <label className="flex w-fit items-center gap-2 text-[12.5px] text-[#4A7A94] cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded"
            />
            Événement actif
          </label>

          {isInternal && (
            <div className="border border-[#E5E7EB] rounded-lg p-4 bg-[#F9FAFB]">
              <h4 className="text-[13px] font-semibold text-[#0D2137] mb-3">
                Règle de détection (MatchRule)
              </h4>
              <p className="text-[12px] text-[#8BAFC0] mb-3">
                Définissez la règle qui déclenchera cet événement lors de la
                réception d'un message.
              </p>
              <MatchRuleBuilder
                value={matchRule}
                onChange={setMatchRule}
                metadata={metadata}
              />
            </div>
          )}

          <div className="border border-[#E5E7EB] rounded-lg p-4 bg-[#F9FAFB]">
            <h4 className="text-[13px] font-semibold text-[#0D2137] mb-3">
              Extractions (CaptureSpec)
            </h4>
            <p className="text-[12px] text-[#8BAFC0] mb-3">
              Configurez les extractions de données depuis le message ou
              l'historique.
            </p>
            <CaptureSpecBuilder value={captureSpec} onChange={setCaptureSpec} />
          </div>

          <div className="flex justify-end pt-2 border-t border-[#E5E7EB]">
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              loading={isSaving}
            >
              <Save size={13} />
              Enregistrer l'événement
            </Button>
          </div>

          {!isNew && event?.id && (
            <div className="pt-4 mt-6 border-t border-[#E5E7EB]">
              <h4 className="text-[14px] font-semibold text-[#0D2137] mb-4">
                Triggers de l'événement
              </h4>
              <TriggerSection
                event={event}
                metadata={metadata}
                onValidateCondition={onValidateCondition}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
