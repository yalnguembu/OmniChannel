import { useState, KeyboardEvent } from "react";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { X, Info } from "lucide-react";
import type { EventEngineMetadataResponse } from "@/shared/api/generated/types.gen";

export interface MatchRuleData {
  type: string;
  values: string[];
  caseSensitive?: boolean;
  fuzzyTolerance?: number;
  direction?: string;
}

interface MatchRuleBuilderProps {
  value: MatchRuleData;
  onChange: (value: MatchRuleData) => void;
  metadata?: EventEngineMetadataResponse;
}

export function MatchRuleBuilder({
  value,
  onChange,
  metadata,
}: MatchRuleBuilderProps) {
  const [inputValue, setInputValue] = useState("");

  const ruleTypes = metadata?.matchRuleTypes?.map((t) => ({
    value: t.value ?? "",
    label: t.label ?? t.value ?? "",
  })) ?? [
    { value: "Exact", label: "Exact" },
    { value: "Contains", label: "Contains" },
    { value: "Regex", label: "Regex" },
    { value: "Keyword", label: "Keyword" },
    { value: "Fuzzy", label: "Fuzzy" },
    { value: "ButtonPayload", label: "ButtonPayload" },
  ];

  const directionTypes = [
    { value: "", label: "Toutes" },
    { value: "INBOUND", label: "Entrant" },
    { value: "OUTBOUND", label: "Sortant" },
  ];

  const handleAddValue = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      if (!value.values.includes(inputValue.trim())) {
        onChange({
          ...value,
          values: [...value.values, inputValue.trim()],
        });
      }
      setInputValue("");
    }
  };

  const handleRemoveValue = (valToRemove: string) => {
    onChange({
      ...value,
      values: value.values.filter((v) => v !== valToRemove),
    });
  };

  const isFuzzy = value.type === "Fuzzy";
  const isRegex = value.type === "Regex";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-start">
          <Select
            label="Type de règle"
            value={value.type}
            onChange={(e) => onChange({ ...value, type: e.target.value })}
            options={ruleTypes.map((t) => ({ value: t.value, label: t.label }))}
          />
          <Select
            label="Direction de la règle"
            value={value.direction}
            onChange={(e) => onChange({ ...value, direction: e.target.value })}
            options={directionTypes.map((t) => ({
              value: t.value,
              label: t.label,
            }))}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[12.5px] font-medium text-[#0D2137]">
            Valeurs de déclenchement
          </label>
          <div className="flex items-center gap-2 border border-[#E5E7EB] rounded-md px-2 py-1.5 bg-white min-h-[38px] flex-wrap">
            {value.values.map((val, idx) => (
              <Badge
                key={idx}
                variant="info"
                className="flex items-center gap-1 h-6"
              >
                {val}
                <button
                  type="button"
                  onClick={() => handleRemoveValue(val)}
                  className="hover:text-red-500 rounded-full focus:outline-none"
                >
                  <X size={10} />
                </button>
              </Badge>
            ))}
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleAddValue}
              placeholder="Ajouter une valeur (Entrée)"
              className="flex-1 outline-none text-[13px] min-w-[150px] bg-transparent"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 pt-2">
        {!isRegex && (
          <label className="flex items-center gap-2 text-[12.5px] text-[#4A7A94] cursor-pointer">
            <input
              type="checkbox"
              checked={value.caseSensitive || false}
              onChange={(e) =>
                onChange({ ...value, caseSensitive: e.target.checked })
              }
              className="rounded"
            />
            Sensible à la casse
          </label>
        )}

        {isFuzzy && (
          <div className="flex items-center gap-2">
            <label className="text-[12.5px] text-[#4A7A94]">
              Tolérance Fuzzy :
            </label>
            <Input
              type="number"
              value={value.fuzzyTolerance?.toString() || "1"}
              onChange={(e) =>
                onChange({
                  ...value,
                  fuzzyTolerance: parseInt(e.target.value) || 1,
                })
              }
              className="w-20"
            />
          </div>
        )}
      </div>
    </div>
  );
}
