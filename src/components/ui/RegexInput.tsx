import { useEffect, useMemo, useState } from "react";
import { Wand2, Check, CircleCheck, CircleX } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

/* ──────────────────────────────────────────────────────────────────────────
 * RegexInput — a validation-regex field with a visual "Assistant" so that
 * non-technical users can build a pattern without knowing regular expressions.
 * The raw expression stays visible/editable for advanced users.
 *
 * Design-system primitive: usable anywhere a regex/pattern is captured
 * (product attribute schema, contact import attributes, system settings…).
 * ──────────────────────────────────────────────────────────────────────── */

const DEFAULT_HINT =
  "Astuce : ouvrez l'assistant pour générer la règle sans connaître les expressions régulières.";

interface RegexInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Helper text under the field. Pass `null` to hide it (e.g. dense grids). */
  hint?: string | null;
}

export function RegexInput({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: RegexInputProps) {
  const [open, setOpen] = useState(false);
  const hintText = hint === undefined ? DEFAULT_HINT : hint;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-[12.5px] font-medium text-[#0D2137]">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder ?? "^[0-9]+$"}
            className="font-mono"
          />
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setOpen(true)}
          className="shrink-0"
        >
          <Wand2 size={13} />
          Assistant
        </Button>
      </div>
      {hintText && (
        <p className="text-[11.5px] text-[#8BAFC0] leading-relaxed">
          {hintText}
        </p>
      )}

      <RegexBuilderModal
        open={open}
        initial={value}
        onClose={() => setOpen(false)}
        onApply={(v) => {
          onChange(v);
          setOpen(false);
        }}
      />
    </div>
  );
}

/* ── Presets ────────────────────────────────────────────────────────────── */

interface Preset {
  label: string;
  pattern: string;
  sample: string;
}

const PRESETS: Preset[] = [
  { label: "Email", pattern: "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$", sample: "kofi@example.com" },
  { label: "Téléphone", pattern: "^\\+?[0-9\\s().-]{6,20}$", sample: "+224 620 00 00 00" },
  { label: "Chiffres uniquement", pattern: "^[0-9]+$", sample: "12345" },
  { label: "Lettres uniquement", pattern: "^[A-Za-zÀ-ÿ\\s]+$", sample: "Aïcha Traoré" },
  { label: "Alphanumérique", pattern: "^[A-Za-z0-9]+$", sample: "ABC123" },
  { label: "Code postal (5 chiffres)", pattern: "^[0-9]{5}$", sample: "75001" },
  { label: "Date JJ/MM/AAAA", pattern: "^\\d{2}/\\d{2}/\\d{4}$", sample: "08/06/2026" },
  { label: "Montant décimal", pattern: "^[0-9]+([.,][0-9]{1,2})?$", sample: "1499,90" },
  { label: "URL (http/https)", pattern: "^https?://[^\\s]+$", sample: "https://exemple.com" },
];

/* ── Character-class options for the rule builder ───────────────────────── */

const CHAR_OPTIONS: { key: string; label: string; cls: string }[] = [
  { key: "lower", label: "Lettres minuscules (a → z)", cls: "a-z" },
  { key: "upper", label: "Lettres majuscules (A → Z)", cls: "A-Z" },
  { key: "accents", label: "Lettres accentuées (é, à, ô…)", cls: "À-ÿ" },
  { key: "digits", label: "Chiffres (0 → 9)", cls: "0-9" },
  { key: "spaces", label: "Espaces", cls: "\\s" },
  { key: "dash", label: "Tiret et underscore (-, _)", cls: "_\\-" },
  { key: "punct", label: "Ponctuation (. , ; : ! ?)", cls: ".,;:!?" },
];

type LengthMode = "any" | "exact" | "min" | "range";

function buildCustomPattern(
  selected: Record<string, boolean>,
  lengthMode: LengthMode,
  n: number | null,
  m: number | null,
): string {
  const cls = CHAR_OPTIONS.filter((o) => selected[o.key])
    .map((o) => o.cls)
    .join("");
  const body = cls ? `[${cls}]` : ".";

  let quant = "+";
  if (lengthMode === "exact" && n) quant = `{${n}}`;
  else if (lengthMode === "min" && n) quant = `{${n},}`;
  else if (lengthMode === "range" && n && m) quant = `{${n},${m}}`;

  return `^${body}${quant}$`;
}

/* ── Builder modal ──────────────────────────────────────────────────────── */

function RegexBuilderModal({
  open,
  initial,
  onClose,
  onApply,
}: {
  open: boolean;
  initial: string;
  onClose: () => void;
  onApply: (value: string) => void;
}) {
  const [pattern, setPattern] = useState(initial);
  const [sample, setSample] = useState("");

  // Rule-builder state
  const [selected, setSelected] = useState<Record<string, boolean>>({
    lower: true,
    upper: true,
  });
  const [lengthMode, setLengthMode] = useState<LengthMode>("any");
  const [minLen, setMinLen] = useState<number | null>(null);
  const [maxLen, setMaxLen] = useState<number | null>(null);

  // Reset to the field's current value each time the assistant opens.
  useEffect(() => {
    if (open) {
      setPattern(initial);
      setSample("");
    }
  }, [open, initial]);

  const customPattern = useMemo(
    () => buildCustomPattern(selected, lengthMode, minLen, maxLen),
    [selected, lengthMode, minLen, maxLen],
  );

  const compiled = useMemo(() => {
    if (!pattern) return { valid: true, error: "" };
    try {
      new RegExp(pattern);
      return { valid: true, error: "" };
    } catch {
      return { valid: false, error: "Expression invalide" };
    }
  }, [pattern]);

  const testResult = useMemo(() => {
    if (!pattern || !sample || !compiled.valid) return null;
    try {
      return new RegExp(pattern).test(sample);
    } catch {
      return null;
    }
  }, [pattern, sample, compiled.valid]);

  const toggle = (key: string) =>
    setSelected((s) => ({ ...s, [key]: !s[key] }));

  const num = (v: string): number | null =>
    v.trim() === "" ? null : Math.max(0, Number(v));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Assistant de règle de validation"
      subtitle="Générez l'expression sans connaître les regex"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={() => onApply(pattern)}
            disabled={!pattern || !compiled.valid}
          >
            <Check size={14} />
            Appliquer
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        {/* 1 — Presets */}
        <section>
          <h3 className="text-[13px] font-semibold text-[#0D2137] mb-2">
            Modèles courants
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {PRESETS.map((p) => {
              const active = pattern === p.pattern;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setPattern(p.pattern)}
                  className={`text-left px-3 py-2 rounded-md border transition-all ${
                    active
                      ? "border-[#2E8FAD] bg-[#E8F4F8]"
                      : "border-[#E5E7EB] bg-white hover:border-[#B8CDD8]"
                  }`}
                >
                  <div className="text-[12.5px] font-medium text-[#0D2137]">
                    {p.label}
                  </div>
                  <div className="text-[11px] text-[#8BAFC0] truncate">
                    ex : {p.sample}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 2 — Rule builder */}
        <section>
          <h3 className="text-[13px] font-semibold text-[#0D2137] mb-2">
            Ou construire une règle
          </h3>

          <p className="text-[12px] text-[#4A7A94] mb-1.5">
            Caractères autorisés
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
            {CHAR_OPTIONS.map((o) => (
              <label
                key={o.key}
                className="flex items-center gap-2 text-[12.5px] text-[#0D2137] cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={!!selected[o.key]}
                  onChange={() => toggle(o.key)}
                  className="rounded"
                />
                {o.label}
              </label>
            ))}
          </div>

          <p className="text-[12px] text-[#4A7A94] mt-4 mb-1.5">Longueur</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {(
              [
                ["any", "Indifférente"],
                ["exact", "Exactement"],
                ["min", "Au moins"],
                ["range", "Entre"],
              ] as [LengthMode, string][]
            ).map(([mode, lbl]) => (
              <label
                key={mode}
                className="flex items-center gap-1.5 text-[12.5px] text-[#0D2137] cursor-pointer"
              >
                <input
                  type="radio"
                  name="length-mode"
                  checked={lengthMode === mode}
                  onChange={() => setLengthMode(mode)}
                />
                {lbl}
              </label>
            ))}
          </div>

          {lengthMode !== "any" && (
            <div className="flex items-center gap-2 mt-2">
              <div className="w-28">
                <Input
                  type="number"
                  placeholder={lengthMode === "range" ? "min" : "nombre"}
                  value={minLen ?? ""}
                  onChange={(e) => setMinLen(num(e.target.value))}
                />
              </div>
              {lengthMode === "range" && (
                <>
                  <span className="text-[12px] text-[#8BAFC0]">et</span>
                  <div className="w-28">
                    <Input
                      type="number"
                      placeholder="max"
                      value={maxLen ?? ""}
                      onChange={(e) => setMaxLen(num(e.target.value))}
                    />
                  </div>
                </>
              )}
              <span className="text-[12px] text-[#8BAFC0]">caractères</span>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 mt-3 p-2.5 rounded-md bg-[#F9FAFB] border border-[#E5E7EB]">
            <code className="text-[12px] font-mono text-[#1B5E82] truncate">
              {customPattern}
            </code>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPattern(customPattern)}
              className="shrink-0"
            >
              Utiliser cette règle
            </Button>
          </div>
        </section>

        {/* 3 — Generated expression + live test */}
        <section className="border-t border-[#E5E7EB] pt-4">
          <Input
            label="Expression générée"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            error={compiled.valid ? undefined : compiled.error}
            className="font-mono"
            placeholder="^[A-Za-z]+$"
          />

          <div className="mt-3">
            <Input
              label="Tester une valeur"
              value={sample}
              onChange={(e) => setSample(e.target.value)}
              placeholder="Saisissez un exemple pour vérifier la règle"
            />
            {testResult !== null && (
              <div
                className={`mt-1.5 flex items-center gap-1.5 text-[12px] ${
                  testResult ? "text-[#16A34A]" : "text-[#DC2626]"
                }`}
              >
                {testResult ? <CircleCheck size={14} /> : <CircleX size={14} />}
                {testResult
                  ? "La valeur correspond à la règle."
                  : "La valeur ne correspond pas à la règle."}
              </div>
            )}
          </div>
        </section>
      </div>
    </Modal>
  );
}
