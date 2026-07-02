import { useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Toggle } from "@/components/ui/Toggle";
import { ACTION_TYPES, defaultConfigFor } from "../actionTypes";
import { EntitySelect } from "../EntitySelect";
import type { TriggerActionDto } from "@/shared/api/generated/types.gen";

interface TriggerActionBuilderProps {
  action?: TriggerActionDto;
  /** Scopes product-filtered entity dropdowns (template, segment). */
  productId?: string;
  onSave: (data: Partial<TriggerActionDto>) => Promise<void>;
  onCancel: () => void;
}

const ACTION_TYPE_OPTIONS = Object.entries(ACTION_TYPES).map(([value, def]) => ({
  value,
  label: def.label,
}));

function parseConfig(configJson?: string | null): Record<string, unknown> {
  if (!configJson) return {};
  try {
    return JSON.parse(configJson);
  } catch {
    return {};
  }
}

export function TriggerActionBuilder({ action, productId, onSave, onCancel }: TriggerActionBuilderProps) {
  const [type, setType] = useState(action?.type || "SendText");
  const [cfg, setCfg] = useState<Record<string, unknown>>(() =>
    action ? parseConfig(action.configJson) : defaultConfigFor(type),
  );
  const [orderIndex, setOrderIndex] = useState(action?.orderIndex ?? 10);
  const [delaySeconds, setDelaySeconds] = useState(action?.delaySeconds ?? 0);
  const [continueOnError, setContinueOnError] = useState(action?.continueOnError ?? false);
  const [isSaving, setIsSaving] = useState(false);

  const def = ACTION_TYPES[type];

  const handleTypeChange = (nextType: string) => {
    setType(nextType);
    setCfg(defaultConfigFor(nextType));
  };

  const setField = (key: string, value: unknown) => {
    setCfg((c) => ({ ...c, [key]: value }));
  };

  const handleSave = async () => {
    const missing = def.fields.filter(
      (f) => f.required && !String(cfg[f.key] ?? "").trim(),
    );
    if (missing.length) {
      toast.error(`Champ requis manquant : ${missing.map((f) => f.label).join(", ")}`);
      return;
    }

    const configJson: Record<string, unknown> = {};
    def.fields.forEach((f) => {
      const v = cfg[f.key];
      if (f.type === "bool") {
        configJson[f.key] = !!v;
        return;
      }
      const trimmed = String(v ?? "").trim();
      if (!trimmed) {
        if (f.optional) configJson[f.key] = null;
        return;
      }
      configJson[f.key] = trimmed;
    });

    try {
      setIsSaving(true);
      await onSave({
        type,
        configJson: JSON.stringify(configJson),
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
          onChange={(e) => handleTypeChange(e.target.value)}
          options={ACTION_TYPE_OPTIONS}
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

      {(def.help || def.fields.length > 0) && (
        <div className="border border-[#E5E7EB] rounded-lg p-4 bg-white space-y-3">
          <h4 className="text-[13px] font-semibold text-[#0D2137]">Configuration</h4>
          {def.help && <p className="text-[12px] text-[#8BAFC0]">{def.help}</p>}

          {def.fields.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {def.fields.map((f) => {
                const value = cfg[f.key];
                const label = `${f.label}${f.required ? " *" : ""}`;

                if (f.type === "bool") {
                  return (
                    <div
                      key={f.key}
                      className="flex items-center justify-between rounded-md border border-[#E5E7EB] bg-[#F7F8F9] p-3 md:col-span-2"
                    >
                      <span className="text-[13px] text-[#0D2137]">{f.label}</span>
                      <Toggle
                        checked={!!value}
                        onChange={(v) => setField(f.key, v)}
                      />
                    </div>
                  );
                }

                if (f.type === "entity" && f.source) {
                  return (
                    <EntitySelect
                      key={f.key}
                      source={f.source}
                      label={label}
                      value={(value as string) ?? ""}
                      onChange={(v) => setField(f.key, v)}
                      productId={productId}
                      emptyLabel={f.required ? "Sélectionner…" : "Aucun"}
                    />
                  );
                }

                if (f.type === "select") {
                  return (
                    <Select
                      key={f.key}
                      label={label}
                      value={(value as string) ?? ""}
                      onChange={(e) => setField(f.key, e.target.value)}
                      options={(f.options ?? []).map((o) => ({ value: o, label: o }))}
                    />
                  );
                }

                if (f.type === "area") {
                  return (
                    <div key={f.key} className="md:col-span-2 flex flex-col gap-1.5">
                      <label className="text-[12.5px] font-medium text-[#0D2137]">{label}</label>
                      <textarea
                        className="w-full h-24 p-3 text-[13px] border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#2E8FAD]"
                        value={(value as string) ?? ""}
                        onChange={(e) => setField(f.key, e.target.value)}
                        placeholder={f.placeholder}
                      />
                    </div>
                  );
                }

                return (
                  <Input
                    key={f.key}
                    label={label}
                    value={(value as string) ?? ""}
                    onChange={(e) => setField(f.key, e.target.value)}
                    placeholder={f.placeholder}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between rounded-md border border-[#E5E7EB] bg-[#F7F8F9] p-3 w-fit gap-6">
        <span className="text-[13px] text-[#0D2137]">Continuer en cas d'erreur</span>
        <Toggle checked={continueOnError} onChange={setContinueOnError} />
      </div>

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
