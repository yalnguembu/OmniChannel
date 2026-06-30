import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { RegexInput } from "@/components/ui/RegexInput";

export interface CaptureConfig {
  name: string;
  source: string;
  mode: string;
  pattern?: string;
  pick?: string;
  resultType?: string;
  windowDays?: number;
  direction?: string;
  excludeCurrent?: boolean;
}

export interface CaptureSpecData {
  captures: CaptureConfig[];
}

interface CaptureSpecBuilderProps {
  value: CaptureSpecData;
  onChange: (value: CaptureSpecData) => void;
}

export function CaptureSpecBuilder({ value, onChange }: CaptureSpecBuilderProps) {
  const captures = value.captures || [];

  const handleAdd = () => {
    onChange({
      captures: [
        ...captures,
        {
          name: "",
          source: "body",
          mode: "extract",
          pattern: "",
          pick: "first",
          resultType: "String",
        },
      ],
    });
  };

  const handleUpdate = (index: number, patch: Partial<CaptureConfig>) => {
    const next = [...captures];
    next[index] = { ...next[index], ...patch };
    onChange({ captures: next });
  };

  const handleRemove = (index: number) => {
    onChange({
      captures: captures.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-3">
      {captures.length === 0 && (
        <p className="text-[13px] text-[#8BAFC0] text-center py-2">
          Aucune extraction configurée.
        </p>
      )}

      {captures.map((capture, i) => (
        <div
          key={i}
          className="border border-[#E5E7EB] bg-white rounded-md p-3 relative space-y-3"
        >
          <button
            type="button"
            onClick={() => handleRemove(i)}
            className="absolute top-3 right-3 text-[#8BAFC0] hover:text-[#DC2626] transition-colors"
            title="Supprimer l'extraction"
          >
            <Trash2 size={14} />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pr-6">
            <Input
              label="Nom de la variable *"
              placeholder="ex: order_id"
              value={capture.name}
              onChange={(e) => handleUpdate(i, { name: e.target.value })}
            />
            <Select
              label="Source"
              value={capture.source}
              onChange={(e) => handleUpdate(i, { source: e.target.value })}
              options={[
                { value: "body", label: "Contenu du message (body)" },
                { value: "payload", label: "Payload structuré" },
                { value: "metadata", label: "Métadonnées" },
                { value: "recentInbound", label: "Historique récent entrant" },
              ]}
            />
            <Select
              label="Mode"
              value={capture.mode}
              onChange={(e) => handleUpdate(i, { mode: e.target.value })}
              options={[
                { value: "extract", label: "Extraction (RegEx/JsonPath)" },
                { value: "count", label: "Comptage" },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {capture.mode === "extract" && (
              <div className="md:col-span-2">
                <RegexInput
                  label="Pattern (RegEx ou JsonPath)"
                  value={capture.pattern || ""}
                  onChange={(pattern) => handleUpdate(i, { pattern })}
                />
              </div>
            )}
            
            {capture.mode === "extract" && (
              <Select
                label="Sélection (Pick)"
                value={capture.pick || "first"}
                onChange={(e) => handleUpdate(i, { pick: e.target.value })}
                options={[
                  { value: "first", label: "Premier résultat" },
                  { value: "last", label: "Dernier résultat" },
                  { value: "all", label: "Tous (Tableau)" },
                ]}
              />
            )}

            <Select
              label="Type de résultat"
              value={capture.resultType || "String"}
              onChange={(e) => handleUpdate(i, { resultType: e.target.value })}
              options={[
                { value: "String", label: "Texte (String)" },
                { value: "Integer", label: "Nombre Entier (Integer)" },
                { value: "Decimal", label: "Nombre Décimal (Decimal)" },
              ]}
            />
          </div>
        </div>
      ))}

      <Button variant="secondary" size="sm" onClick={handleAdd}>
        <Plus size={13} />
        Ajouter une extraction
      </Button>
    </div>
  );
}
