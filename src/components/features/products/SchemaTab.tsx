import { useRef, useState, type ReactNode } from "react";
import {
  Plus,
  Trash2,
  Save,
  Database,
  ArrowLeftRight,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Activity,
  X,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import {
  useProductAttributeSchema,
  type DraftAttribute,
} from "@/hooks/useProductAttributeSchema";
import type {
  AttributeTypeFieldsInfo,
  SelectOption,
  ValidationResultResponse,
  SchemaImpactResponse,
  DerivedFunctionInfo,
} from "@/shared/api/generated/types.gen";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/feedback/PageLoader";
import { RegexInput } from "@/components/ui/RegexInput";
import { cn } from "@/lib/utils";

export function SchemaTab({ productId }: { productId: string }) {
  const vm = useProductAttributeSchema(productId);

  if (vm.isMetadataLoading || vm.isSchemaLoading || vm.isMappingLoading)
    return <PageLoader />;

  // Derived attributes are computed server-side and never imported, so they're
  // excluded from the import-column mapping.
  const mappedAttributes = vm.attributes.filter(
    (a) => a.key.trim() !== "" && !a.derived,
  );

  // Mapping targets = reserved keywords (app-internal client fields) + custom
  // attributes. Reserved keys must always be present in the client mapping.
  const mappingTargets = (() => {
    const seen = new Set<string>();
    const reserved = vm.reservedKeyList.map((k) => ({
      key: k,
      label: k,
      kind: "reserved" as const,
    }));
    const custom = mappedAttributes.map((a) => ({
      key: a.key,
      label: a.label || a.key,
      kind: "custom" as const,
    }));
    return [...reserved, ...custom].filter((t) => {
      const k = t.key.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  })();

  return (
    <div className="w-full xl:grid xl:grid-cols-2 xl:gap-4">
      {/* ── Attribute Schema ─────────────────────────────────────────────── */}
      <section className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2">
            <Database size={15} className="text-[#2E8FAD]" />
            <h2 className="text-[14px] font-semibold text-[#0D2137]">
              Schéma d'attributs
            </h2>
            {vm.schemaVersion !== undefined && (
              <span className="text-[11px] text-[#8BAFC0] bg-[#F0F2F4] px-2 py-0.5 rounded-full">
                v{vm.schemaVersion}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              loading={vm.isValidating}
              onClick={() => vm.handleValidate()}
              disabled={vm.attributes.length === 0}
            >
              <ShieldCheck size={13} />
              Valider
            </Button>
            <Button
              variant="secondary"
              size="sm"
              loading={vm.isAnalyzingImpact}
              onClick={() => vm.handleAnalyzeImpact()}
              disabled={vm.attributes.length === 0}
            >
              <Activity size={13} />
              Analyser l'impact
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={vm.isSavingSchema}
              onClick={vm.handleSaveAttributes}
              disabled={vm.hasBlockingErrors}
            >
              <Save size={13} />
              Enregistrer
            </Button>
          </div>
        </div>

        <div className="p-5 space-y-3">
          {vm.validation && <ValidationPanel result={vm.validation} />}
          {vm.impact && (
            <ImpactPanel result={vm.impact} onClose={vm.clearImpact} />
          )}

          {vm.attributes.length === 0 && (
            <p className="text-[13px] text-[#8BAFC0] text-center py-4">
              Aucun attribut défini. Ajoutez des attributs pour structurer vos
              contacts.
            </p>
          )}

          {vm.attributes.map((attr, i) => (
            <AttributeCard
              key={i}
              attr={attr}
              info={vm.typeInfoFor(attr.type)}
              types={vm.types}
              keyErr={vm.keyErrorFor(attr.key)}
              derivedFunctions={vm.derivedFunctions}
              reservedKeys={Array.from(vm.reservedKeys)}
              otherKeys={vm.attributes
                .filter((_, j) => j !== i)
                .map((a) => a.key)
                .filter((k) => k.trim() !== "")}
              defaultOpen={attr.key.trim() === ""}
              onUpdate={(patch) => vm.handleUpdateAttribute(i, patch)}
              onRemove={() => vm.handleRemoveAttribute(i)}
              onAddOption={() => vm.handleAddOption(i)}
              onUpdateOption={(oi, patch) =>
                vm.handleUpdateOption(i, oi, patch)
              }
              onRemoveOption={(oi) => vm.handleRemoveOption(i, oi)}
            />
          ))}

          <Button variant="secondary" size="sm" onClick={vm.handleAddAttribute}>
            <Plus size={13} />
            Ajouter un attribut
          </Button>
        </div>
      </section>

      {/* ── Client Mapping ───────────────────────────────────────────────── */}
      <section className="bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2">
            <ArrowLeftRight size={15} className="text-[#2E8FAD]" />
            <h2 className="text-[14px] font-semibold text-[#0D2137]">
              Mapping des colonnes d'import
            </h2>
          </div>
          <Button
            variant="primary"
            size="sm"
            loading={vm.isSavingMapping}
            onClick={vm.handleSaveMapping}
          >
            <Save size={13} />
            Enregistrer
          </Button>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-[12.5px] text-[#8BAFC0]">
            Associez chaque champ réservé et attribut du schéma à la colonne (ou
            l'index) de votre fichier d'import. Les champs laissés vides ne sont
            pas enregistrés.
          </p>

          {mappingTargets.length === 0 ? (
            <p className="text-[13px] text-[#8BAFC0] text-center py-4">
              Définissez d'abord des attributs (avec une clé) pour pouvoir les
              mapper.
            </p>
          ) : (
            mappingTargets.map((t) => (
              <div key={t.key} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="px-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-md text-[13px] text-[#0D2137] truncate flex items-center gap-1.5">
                    <span className="font-medium">{t.label}</span>
                    {t.kind === "reserved" ? (
                      <Badge variant="info" className="shrink-0">
                        Réservé
                      </Badge>
                    ) : (
                      <span className="text-[#8BAFC0]">({t.key})</span>
                    )}
                  </div>
                </div>
                <ArrowLeftRight
                  size={14}
                  className="text-[#8BAFC0] shrink-0"
                />
                <div className="flex-1">
                  <Input
                    placeholder="Colonne CSV (ex: FIRST_NAME) ou index (0, 1…)"
                    value={vm.mapping[t.key] ?? ""}
                    onChange={(e) =>
                      vm.handleUpdateMapping(t.key, e.target.value)
                    }
                  />
                </div>
              </div>
            ))
          )}

          {/* Legacy / orphan mappings whose key no longer matches an attribute. */}
          <OrphanMappings
            mapping={vm.mapping}
            attributeKeys={vm.attributes.map((a) => a.key)}
            reservedKeys={vm.reservedKeyList}
            onUpdate={vm.handleUpdateMapping}
            onRemove={vm.handleRemoveMapping}
          />
        </div>
      </section>
    </div>
  );
}

/* ── Attribute card ───────────────────────────────────────────────────────── */

function AttributeCard({
  attr,
  info,
  types,
  keyErr,
  derivedFunctions,
  reservedKeys,
  otherKeys,
  defaultOpen,
  onUpdate,
  onRemove,
  onAddOption,
  onUpdateOption,
  onRemoveOption,
}: {
  attr: DraftAttribute;
  info?: AttributeTypeFieldsInfo;
  types: AttributeTypeFieldsInfo[];
  keyErr?: string;
  derivedFunctions: DerivedFunctionInfo[];
  reservedKeys: string[];
  otherKeys: string[];
  defaultOpen: boolean;
  onUpdate: (patch: Partial<DraftAttribute>) => void;
  onRemove: () => void;
  onAddOption: () => void;
  onUpdateOption: (optIndex: number, patch: Partial<SelectOption>) => void;
  onRemoveOption: (optIndex: number) => void;
}) {
  const num = (v: string): number | null =>
    v.trim() === "" ? null : Number(v);

  const typeOptions = types.map((t) => ({
    value: t.type ?? "",
    label: t.label ?? t.type ?? "",
  }));
  const typeLabel =
    typeOptions.find((o) => o.value === attr.type)?.label ?? attr.type;
  const [open, setOpen] = useState(defaultOpen);

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
            {attr.key.trim() || "Nouvel attribut"}
          </span>
          {attr.label && (
            <span className="truncate text-[12.5px] text-[#8BAFC0]">
              · {attr.label}
            </span>
          )}
          <span className="ml-auto shrink-0 rounded-full bg-[#F0F2F4] px-1.5 py-0.5 text-[11px] text-[#4A7A94]">
            {typeLabel}
          </span>
          {attr.derived && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#E8F4F8] px-1.5 py-0.5 text-[10px] text-[#2E8FAD]">
              <Sparkles size={10} /> Dérivé
            </span>
          )}
          {attr.required && !attr.derived && (
            <span className="shrink-0 rounded-full bg-[#FEF3C7] px-1.5 py-0.5 text-[10px] text-[#D97706]">
              Requis
            </span>
          )}
          {keyErr && (
            <span className="shrink-0 rounded-full bg-[#FEE2E2] px-1.5 py-0.5 text-[10px] text-[#DC2626]">
              {keyErr}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 p-1.5 text-[#8BAFC0] transition-colors hover:text-[#DC2626]"
          title="Supprimer l'attribut"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Editor body — collapsible */}
      {open && (
        <div className="space-y-3 border-t border-[#E5E7EB] px-4 pb-4 pt-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              label="Clé *"
              placeholder="loyalty_pts"
              value={attr.key}
              error={keyErr}
              onChange={(e) => onUpdate({ key: e.target.value })}
            />
            <Input
              label="Libellé *"
              placeholder="Points fidélité"
              value={attr.label}
              onChange={(e) => onUpdate({ label: e.target.value })}
            />
            <Select
              label="Type"
              value={attr.type}
              onChange={(e) => onUpdate({ type: e.target.value })}
              options={typeOptions}
            />
          </div>

          <label className="flex w-fit items-center gap-2 text-[12.5px] text-[#4A7A94] cursor-pointer">
            <input
              type="checkbox"
              checked={attr.derived}
              onChange={(e) => onUpdate({ derived: e.target.checked })}
              className="rounded"
            />
            <Sparkles size={13} className="text-[#2E8FAD]" />
            Attribut dérivé (calculé côté serveur)
          </label>

          {attr.derived ? (
            <DerivedEditor
              attr={attr}
              derivedFunctions={derivedFunctions}
              reservedKeys={reservedKeys}
              otherKeys={otherKeys}
              onUpdate={onUpdate}
            />
          ) : (
            <>
              <div className="flex flex-wrap items-end gap-4">
                <label className="flex items-center gap-1.5 text-[12px] text-[#4A7A94] whitespace-nowrap pb-2">
                  <input
                    type="checkbox"
                    checked={attr.required}
                    onChange={(e) => onUpdate({ required: e.target.checked })}
                    className="rounded"
                  />
                  Requis
                </label>

                {info?.requiresCurrencyCode && (
                  <div className="w-28">
                    <Input
                      label="Devise *"
                      placeholder="XOF"
                      value={attr.currencyCode}
                      onChange={(e) =>
                        onUpdate({ currencyCode: e.target.value })
                      }
                    />
                  </div>
                )}
              </div>

              {/* Options first (Select / MultiSelect) — the default value picks from them. */}
              {info?.supportsOptions && (
                <OptionsEditor
                  options={attr.options}
                  onAdd={onAddOption}
                  onUpdate={onUpdateOption}
                  onRemove={onRemoveOption}
                />
              )}

              <DefaultValueField
                type={attr.type}
                valueKind={info?.valueKind}
                supportsOptions={!!info?.supportsOptions}
                options={attr.options}
                value={attr.defaultValue}
                onChange={(defaultValue) => onUpdate({ defaultValue })}
              />

              {info?.supportsRange && (
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Min"
                    type="number"
                    value={attr.min ?? ""}
                    onChange={(e) => onUpdate({ min: num(e.target.value) })}
                  />
                  <Input
                    label="Max"
                    type="number"
                    value={attr.max ?? ""}
                    onChange={(e) => onUpdate({ max: num(e.target.value) })}
                  />
                </div>
              )}

              {info?.supportsLength && (
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Longueur min"
                    type="number"
                    value={attr.minLength ?? ""}
                    onChange={(e) =>
                      onUpdate({ minLength: num(e.target.value) })
                    }
                  />
                  <Input
                    label="Longueur max"
                    type="number"
                    value={attr.maxLength ?? ""}
                    onChange={(e) =>
                      onUpdate({ maxLength: num(e.target.value) })
                    }
                  />
                </div>
              )}

              {/* Regex only for free-text (Text); Email/Phone/Url already validate format. */}
              {!!info?.supportsRegex &&
                !["Email", "Phone", "Url"].includes(attr.type) && (
                  <RegexInput
                    label="Regex de validation"
                    value={attr.regex}
                    onChange={(regex) => onUpdate({ regex })}
                  />
                )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Derived attribute editor (expression + result type + help) ─────────────── */

function TokenRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="w-18 shrink-0 text-[11px] font-medium text-[#8BAFC0]">
        {label}
      </span>
      {children}
    </div>
  );
}

function TokenChip({
  label,
  token,
  title,
  onInsert,
}: {
  label: string;
  token: string;
  title?: string;
  onInsert: (token: string) => void;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={() => onInsert(token)}
      className="rounded-full border border-[#E5E7EB] bg-white px-2 py-0.5 font-mono text-[11px] text-[#0D2137] transition-colors hover:border-[#2E8FAD] hover:text-[#2E8FAD]"
    >
      {label}
    </button>
  );
}

function DerivedEditor({
  attr,
  derivedFunctions,
  reservedKeys,
  otherKeys,
  onUpdate,
}: {
  attr: DraftAttribute;
  derivedFunctions: DerivedFunctionInfo[];
  reservedKeys: string[];
  otherKeys: string[];
  onUpdate: (patch: Partial<DraftAttribute>) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // Insert a token at the caret (append if the textarea isn't focused).
  const insert = (token: string) => {
    const el = ref.current;
    const cur = attr.expression;
    if (!el) {
      onUpdate({ expression: cur + token });
      return;
    }
    const s = el.selectionStart ?? cur.length;
    const e = el.selectionEnd ?? cur.length;
    onUpdate({ expression: cur.slice(0, s) + token + cur.slice(e) });
    requestAnimationFrame(() => {
      el.focus();
      const pos = s + token.length;
      el.setSelectionRange(pos, pos);
    });
  };

  return (
    <div className="space-y-3 rounded-md border border-[#E5E7EB] bg-white p-3">
      <div>
        <label className="mb-1 block text-[12.5px] font-medium text-[#0D2137]">
          Expression *
        </label>
        <textarea
          ref={ref}
          value={attr.expression}
          onChange={(e) => onUpdate({ expression: e.target.value })}
          placeholder="yearsBetween(birthDate, today())"
          spellCheck={false}
          className="min-h-17 w-full rounded-md border border-[#E5E7EB] bg-white px-3 py-2 font-mono text-[12.5px] text-[#0D2137] outline-none transition-all focus:border-[#2E8FAD] focus:shadow-[0_0_0_3px_rgba(46,143,173,0.1)]"
        />
        <p className="mt-1 text-[11px] text-[#8BAFC0]">
          Cliquez un jeton pour l'insérer dans l'expression.
        </p>
      </div>

      <div className="space-y-2">
        {derivedFunctions.length > 0 && (
          <TokenRow label="Fonctions">
            {derivedFunctions.map((f, i) => (
              <TokenChip
                key={i}
                label={f.signature ?? ""}
                token={f.signature ?? ""}
                title={f.description ?? undefined}
                onInsert={insert}
              />
            ))}
          </TokenRow>
        )}
        {(otherKeys.length > 0 || reservedKeys.length > 0) && (
          <TokenRow label="Champs">
            {otherKeys.map((k) => (
              <TokenChip key={`o-${k}`} label={k} token={k} onInsert={insert} />
            ))}
            {reservedKeys.map((k) => (
              <TokenChip
                key={`n-${k}`}
                label={k}
                token={k}
                title="Champ natif"
                onInsert={insert}
              />
            ))}
          </TokenRow>
        )}
        <TokenRow label="Opérateurs">
          {[
            "!",
            "not",
            "-",
            "~",
            "**",
            "*",
            "/",
            "%",
            "+",
            "-",
            "=",
            "==",
            "!=",
            "<>",
            "<",
            "<=",
            ">",
            ">=",
            "IN",
            "NOT IN",
            "LIKE",
            "NOT LIKE",
            "and",
            "&&",
            "or",
            "||",
            "&",
            "|",
            "^",
            "<<",
            ">>",
          ].map((op) => (
            <TokenChip
              key={op}
              label={op}
              token={op === "," ? ", " : ` ${op} `}
              onInsert={insert}
            />
          ))}
        </TokenRow>
      </div>
    </div>
  );
}

/* ── Default-value field (widget driven by the type's valueKind) ────────────── */

function DefaultValueField({
  type,
  valueKind,
  supportsOptions,
  options,
  value,
  onChange,
}: {
  type: string;
  valueKind?: string | null;
  supportsOptions: boolean;
  options: SelectOption[];
  value: string;
  onChange: (v: string) => void;
}) {
  const label = "Valeur par défaut";

  // Select / MultiSelect → choose among the defined options (contract §2.4).
  if (supportsOptions) {
    if ((options?.length ?? 0) === 0)
      return (
        <p className="text-[12px] italic text-[#8BAFC0]">
          Définissez d'abord des options pour fixer une valeur par défaut.
        </p>
      );
    if (type === "MultiSelect") {
      const selected = value
        ? value
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];
      const toggle = (v: string) => {
        const next = selected.includes(v)
          ? selected.filter((x) => x !== v)
          : [...selected, v];
        onChange(next.join(","));
      };
      return (
        <div>
          <p className="mb-1.5 text-[12.5px] font-medium text-[#0D2137]">
            {label}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {options.map((o) => {
              const v = o.value ?? "";
              const on = selected.includes(v);
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => toggle(v)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-[12px] transition-colors",
                    on
                      ? "border-[#2E8FAD] bg-[#E8F4F8] text-[#1B5E82]"
                      : "border-[#E5E7EB] bg-white text-[#4A7A94] hover:border-[#B8CDD8]",
                  )}
                >
                  {o.label || v}
                </button>
              );
            })}
          </div>
        </div>
      );
    }
    return (
      <Select
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        options={[
          { value: "", label: "—" },
          ...options.map((o) => ({
            value: o.value ?? "",
            label: o.label || o.value || "",
          })),
        ]}
      />
    );
  }

  if (valueKind === "boolean")
    return (
      <Select
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        options={[
          { value: "", label: "—" },
          { value: "true", label: "Vrai" },
          { value: "false", label: "Faux" },
        ]}
      />
    );
  if (valueKind === "number")
    return (
      <Input
        label={label}
        type="number"
        placeholder="—"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  if (valueKind === "date")
    return (
      <Input
        label={label}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  if (valueKind === "dateTime")
    return (
      <Input
        label={label}
        type="datetime-local"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  const inputType =
    type === "Email"
      ? "email"
      : type === "Phone"
        ? "tel"
        : type === "Url"
          ? "url"
          : "text";
  return (
    <Input
      label={label}
      type={inputType}
      placeholder="—"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

/* ── Options sub-editor (Select / MultiSelect) ──────────────────────────────── */

function OptionsEditor({
  options,
  onAdd,
  onUpdate,
  onRemove,
}: {
  options: SelectOption[];
  onAdd: () => void;
  onUpdate: (optIndex: number, patch: Partial<SelectOption>) => void;
  onRemove: (optIndex: number) => void;
}) {
  return (
    <div className="rounded-md border border-[#E5E7EB] bg-white p-3 space-y-2">
      <p className="text-[12px] font-medium text-[#4A7A94]">Options</p>
      {options.length === 0 && (
        <p className="text-[12px] text-[#8BAFC0]">Aucune option.</p>
      )}
      {options.map((o, oi) => (
        <div key={oi} className="flex items-center gap-2">
          <Input
            placeholder="valeur"
            value={o.value ?? ""}
            onChange={(e) => onUpdate(oi, { value: e.target.value })}
          />
          <Input
            placeholder="libellé"
            value={o.label ?? ""}
            onChange={(e) => onUpdate(oi, { label: e.target.value })}
          />
          <button
            onClick={() => onRemove(oi)}
            className="p-1.5 text-[#8BAFC0] hover:text-[#DC2626] transition-colors shrink-0"
            title="Retirer"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ))}
      <Button variant="secondary" size="sm" onClick={onAdd}>
        <Plus size={12} />
        Ajouter une option
      </Button>
    </div>
  );
}

/* ── Validation panel ───────────────────────────────────────────────────────── */

function ValidationPanel({ result }: { result: ValidationResultResponse }) {
  if (result.isValid)
    return (
      <div className="flex items-center gap-2 rounded-md border border-[#86EFAC] bg-[#F0FDF4] px-4 py-3 text-[12.5px] text-[#16A34A]">
        <CheckCircle2 size={15} />
        Le schéma est valide.
      </div>
    );

  return (
    <div className="rounded-md border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3">
      <div className="flex items-center gap-2 text-[12.5px] font-medium text-[#DC2626]">
        <AlertTriangle size={15} />
        {result.errors?.length ?? 0} erreur(s) de validation
      </div>
      <ul className="mt-2 space-y-1">
        {result.errors?.map((e, i) => (
          <li key={i} className="text-[12px] text-[#B91C1C]">
            <span className="font-mono text-[11px] text-[#DC2626]">
              {e.code ?? e.type ?? "ERR"}
            </span>{" "}
            — {e.description}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Impact panel ───────────────────────────────────────────────────────────── */

function ImpactPanel({
  result,
  onClose,
}: {
  result: SchemaImpactResponse;
  onClose: () => void;
}) {
  const invalid = result.invalidCount ?? 0;
  return (
    <div
      className={`rounded-md border px-4 py-3 ${
        invalid > 0
          ? "border-[#FCD34D] bg-[#FFFBEB]"
          : "border-[#86EFAC] bg-[#F0FDF4]"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[12.5px] font-medium text-[#0D2137]">
          <Activity size={15} className="text-[#2E8FAD]" />
          Impact sur les contacts existants
        </div>
        <button
          onClick={onClose}
          className="text-[#8BAFC0] hover:text-[#0D2137] transition-colors"
          title="Fermer"
        >
          <X size={13} />
        </button>
      </div>
      <div className="mt-2 flex gap-6 text-[12.5px]">
        <span className="text-[#4A7A94]">
          Analysés :{" "}
          <strong className="text-[#0D2137]">{result.totalScanned ?? 0}</strong>
        </span>
        <span className="text-[#16A34A]">
          Valides : <strong>{result.validCount ?? 0}</strong>
        </span>
        <span className={invalid > 0 ? "text-[#DC2626]" : "text-[#8BAFC0]"}>
          Invalides : <strong>{invalid}</strong>
        </span>
      </div>
      {result.sample && result.sample.length > 0 && (
        <ul className="mt-2 space-y-1 border-t border-black/5 pt-2">
          {result.sample.map((s, i) => (
            <li key={i} className="text-[12px] text-[#B45309]">
              <span className="font-mono text-[11px]">
                {(s.clientId ?? "").slice(0, 8)}
              </span>{" "}
              — {s.code ? `${s.code}: ` : ""}
              {s.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── Orphan mappings (keys without a matching attribute) ────────────────────── */

function OrphanMappings({
  mapping,
  attributeKeys,
  reservedKeys,
  onUpdate,
  onRemove,
}: {
  mapping: Record<string, string>;
  attributeKeys: string[];
  reservedKeys: string[];
  onUpdate: (key: string, value: string) => void;
  onRemove: (key: string) => void;
}) {
  const known = new Set(attributeKeys);
  // Reserved keywords are the app's internal client fields — legitimate mapping
  // targets, not orphans — so they must never appear in the "to clean up" list.
  const reserved = new Set(reservedKeys.map((k) => k.toLowerCase()));
  const orphans = Object.keys(mapping).filter(
    (k) => !known.has(k) && !reserved.has(k.toLowerCase()),
  );
  if (orphans.length === 0) return null;

  return (
    <div className="mt-2 space-y-2 border-t border-[#E5E7EB] pt-3">
      <p className="text-[12px] text-[#B45309]">
        Mappings sans attribut correspondant (à nettoyer) :
      </p>
      {orphans.map((key) => (
        <div key={key} className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <Input value={key} readOnly className="bg-[#FFFBEB]" />
          </div>
          <ArrowLeftRight size={14} className="text-[#8BAFC0] shrink-0" />
          <div className="flex-1">
            <Input
              value={mapping[key] ?? ""}
              onChange={(e) => onUpdate(key, e.target.value)}
            />
          </div>
          <button
            onClick={() => onRemove(key)}
            className="p-1.5 text-[#8BAFC0] hover:text-[#DC2626] transition-colors shrink-0"
            title="Retirer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
