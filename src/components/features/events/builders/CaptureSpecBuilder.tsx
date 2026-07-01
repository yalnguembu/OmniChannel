import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Toggle } from "@/components/ui/Toggle";
import { RegexInput } from "@/components/ui/RegexInput";

export interface CaptureConfig {
  name: string;
  source: string;
  mode: string;
  pattern?: string;
  windowDays?: number;
  pick?: string;
  fallbackToInbound?: boolean;
  direction?: string;
  excludeCurrent?: boolean;
  resultType?: string;
  attributeKey?: string;
}

export interface CaptureSpecData {
  captures: CaptureConfig[];
}

interface CaptureSpecBuilderProps {
  value: CaptureSpecData;
  onChange: (value: CaptureSpecData) => void;
}

const CAPTURE_SOURCES = [
  { value: "InboundMessage", label: "Message entrant" },
  { value: "ConversationHistory", label: "Historique (fenêtre)" },
  { value: "Payload", label: "Payload de l'événement" },
  { value: "ClientAttribute", label: "Attribut du client" },
];

const CAPTURE_MODES = [
  { value: "extract", label: "Extraction (regex)" },
  { value: "count", label: "Comptage de messages" },
];

const RESULT_TYPES = [
  { value: "Text", label: "Texte (défaut)" },
  { value: "Integer", label: "Entier (>, ≥, <, ≤, between)" },
  { value: "Decimal", label: "Décimal" },
  { value: "Boolean", label: "Booléen" },
  { value: "Date", label: "Date" },
  { value: "DateTime", label: "Date-heure" },
];

const DIRECTIONS = [
  { value: "", label: "(toutes)" },
  { value: "INBOUND", label: "INBOUND" },
  { value: "OUTBOUND", label: "OUTBOUND" },
];

const newCapture = (): CaptureConfig => ({
  name: "",
  source: "ConversationHistory",
  mode: "extract",
  pattern: "",
  windowDays: 35,
  pick: "first",
  fallbackToInbound: true,
  direction: "INBOUND",
  excludeCurrent: true,
  resultType: "Text",
  attributeKey: "",
});

/** Shapes captures for the API: only include fields relevant to source/mode. */
export function buildCaptureSpec(value: CaptureSpecData): CaptureSpecData | null {
  const captures = value.captures ?? [];
  if (!captures.length) return null;

  return {
    captures: captures.map((c) => {
      const o: CaptureConfig = { name: c.name, source: c.source, mode: c.mode };
      if (c.source === "ConversationHistory") o.windowDays = c.windowDays;
      if (c.mode === "extract") {
        if (c.pattern) o.pattern = c.pattern;
        o.fallbackToInbound = c.fallbackToInbound;
        if (c.source === "ConversationHistory") o.pick = c.pick;
      }
      if (c.mode === "count") {
        if (c.direction) o.direction = c.direction;
        o.excludeCurrent = c.excludeCurrent;
      }
      if (c.source === "ClientAttribute" && c.attributeKey) o.attributeKey = c.attributeKey;
      if (c.resultType && c.resultType !== "Text") o.resultType = c.resultType;
      return o;
    }),
  };
}

export function CaptureSpecBuilder({ value, onChange }: CaptureSpecBuilderProps) {
  const captures = value.captures || [];

  const handleAdd = () => {
    onChange({ captures: [...captures, newCapture()] });
  };

  const handleUpdate = (index: number, patch: Partial<CaptureConfig>) => {
    const next = [...captures];
    next[index] = { ...next[index], ...patch };
    onChange({ captures: next });
  };

  const handleRemove = (index: number) => {
    onChange({ captures: captures.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-3">
      {captures.length === 0 && (
        <p className="text-[13px] text-[#8BAFC0] text-center py-2">
          Aucune extraction configurée.
        </p>
      )}

      {captures.map((capture, i) => {
        const isExtract = capture.mode === "extract";
        const isHist = capture.source === "ConversationHistory";
        const isAttr = capture.source === "ClientAttribute";
        const isCount = capture.mode === "count";

        return (
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
                placeholder="ex: numdec"
                value={capture.name}
                onChange={(e) => handleUpdate(i, { name: e.target.value })}
              />
              <Select
                label="Source"
                value={capture.source}
                onChange={(e) => handleUpdate(i, { source: e.target.value })}
                options={CAPTURE_SOURCES}
              />
              <Select
                label="Mode"
                value={capture.mode}
                onChange={(e) => handleUpdate(i, { mode: e.target.value })}
                options={CAPTURE_MODES}
              />
            </div>

            {(isExtract || isAttr) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {isExtract && (
                  <RegexInput
                    label="Pattern (regex, groupe 1 si présent)"
                    value={capture.pattern || ""}
                    onChange={(pattern) => handleUpdate(i, { pattern })}
                    hint={null}
                  />
                )}
                {isAttr && (
                  <Input
                    label="AttributeKey"
                    placeholder="numdec"
                    value={capture.attributeKey || ""}
                    onChange={(e) => handleUpdate(i, { attributeKey: e.target.value })}
                  />
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {isHist && (
                <Input
                  label="Fenêtre (jours)"
                  type="number"
                  value={(capture.windowDays ?? 35).toString()}
                  onChange={(e) => handleUpdate(i, { windowDays: parseInt(e.target.value) || 0 })}
                />
              )}

              {isExtract && isHist && (
                <Select
                  label="Choix (récent → ancien)"
                  value={capture.pick || "first"}
                  onChange={(e) => handleUpdate(i, { pick: e.target.value })}
                  options={[
                    { value: "first", label: "first — plus récent" },
                    { value: "last", label: "last — plus ancien" },
                    { value: "all", label: "all — tous (indexés)" },
                  ]}
                />
              )}

              {isCount && (
                <Select
                  label="Direction"
                  value={capture.direction || ""}
                  onChange={(e) => handleUpdate(i, { direction: e.target.value })}
                  options={DIRECTIONS}
                />
              )}

              <Select
                label="Type de résultat"
                value={capture.resultType || "Text"}
                onChange={(e) => handleUpdate(i, { resultType: e.target.value })}
                options={RESULT_TYPES}
              />
            </div>

            {(isExtract || isCount) && (
              <div className="flex items-center gap-6">
                {isExtract && (
                  <div className="flex items-center gap-2">
                    <Toggle
                      checked={capture.fallbackToInbound ?? true}
                      onChange={(v) => handleUpdate(i, { fallbackToInbound: v })}
                    />
                    <span className="text-[12.5px] text-[#4A7A94]">
                      Repli sur le message entrant
                    </span>
                  </div>
                )}
                {isCount && (
                  <div className="flex items-center gap-2">
                    <Toggle
                      checked={capture.excludeCurrent ?? true}
                      onChange={(v) => handleUpdate(i, { excludeCurrent: v })}
                    />
                    <span className="text-[12.5px] text-[#4A7A94]">
                      Exclure le message courant
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      <Button variant="secondary" size="sm" onClick={handleAdd}>
        <Plus size={13} />
        Ajouter une extraction
      </Button>
    </div>
  );
}
