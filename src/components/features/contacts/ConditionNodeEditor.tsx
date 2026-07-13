import { useEffect, useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { SelectOption } from "@/shared/api/generated/types.gen";
import type {
  useSegmentCriteria,
  CriteriaNode,
  CriteriaEvent,
  CriteriaMessage,
  OperandKind,
} from "@/hooks/useSegmentCriteria";

type SegmentCriteriaVM = ReturnType<typeof useSegmentCriteria>;

const DEFAULT_COUNT_OPS = ["eq", "neq", "gt", "gte", "lt", "lte"];
const DEFAULT_RECENCY_OPS = ["gt", "gte", "lt", "lte"];
const DEFAULT_BOUNDARIES = [
  { code: "last", label: "Dernière occurrence" },
  { code: "first", label: "Première occurrence" },
];
const miniInputCls =
  "w-full px-3 py-2 border border-[#E5E7EB] rounded-md text-[13px] text-[#0D2137] bg-white outline-none transition-colors focus:border-[#2E8FAD]";

/**
 * Recursive editor for one criteria node (group → AND/OR + children ; leaf →
 * attribute → operator → operand). Edits are addressed by `path` (child-index
 * list from the root) through the ViewModel.
 */
export function ConditionNodeEditor({
  node,
  path,
  vm,
  allowEventTag = false,
}: {
  node: CriteriaNode;
  path: number[];
  vm: SegmentCriteriaVM;
  /** Enables the "événement" / "tag" condition nodes (segments only). */
  allowEventTag?: boolean;
}) {
  const isRoot = path.length === 0;

  if (node.kind === "group") {
    const connectors = node.connectors;
    return (
      <div className="rounded-[12px] border border-[#E5E7EB] bg-[#F9FAFB] p-3">
        {!isRoot && (
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#8BAFC0]">
              Sous-groupe
            </span>
            <button
              onClick={() => vm.removeNode(path)}
              className="p-1.5 text-[#8BAFC0] transition-colors hover:text-[#DC2626]"
              title="Supprimer le groupe"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}

        <div className="ml-1 space-y-1.5 border-l-2 border-[#E5E7EB] pl-3">
          {node.children.length === 0 && (
            <p className="py-1 text-[12px] italic text-[#8BAFC0]">
              Groupe vide — ajoutez une condition (sinon il cible tous les
              clients).
            </p>
          )}
          {node.children.map((child, idx) => (
            <div key={idx} className="space-y-1.5">
              {idx > 0 && (
                <div className="flex items-center gap-2 py-0.5">
                  <div className="inline-flex items-center gap-0.5 rounded-[7px] border border-[#E5E7EB] bg-white p-0.5">
                    {vm.logicalOperators.map((op) => {
                      const active = (connectors[idx - 1] ?? "and") === op.code;
                      return (
                        <button
                          key={op.code}
                          onClick={() =>
                            vm.setConnector(path, idx - 1, op.code ?? "and")
                          }
                          title={op.description ?? undefined}
                          className={cn(
                            "rounded-[5px] px-2.5 py-0.5 text-[11px] transition-colors",
                            active
                              ? "bg-[#2E8FAD] font-medium text-white"
                              : "text-[#4A7A94] hover:bg-[#F0F2F4]",
                          )}
                        >
                          {op.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="h-px flex-1 bg-[#E5E7EB]" />
                </div>
              )}
              <ConditionNodeEditor
                node={child}
                path={[...path, idx]}
                vm={vm}
                allowEventTag={allowEventTag}
              />
            </div>
          ))}
        </div>

        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <Button variant="secondary" size="sm" onClick={() => vm.addLeaf(path)}>
            <Plus size={12} /> Condition
          </Button>
          {allowEventTag && vm.addEvent && (
            <Button variant="ghost" size="sm" onClick={() => vm.addEvent(path)}>
              <Plus size={12} /> Événement
            </Button>
          )}
          {allowEventTag && vm.addTag && (
            <Button variant="ghost" size="sm" onClick={() => vm.addTag(path)}>
              <Plus size={12} /> Tag
            </Button>
          )}
          {allowEventTag && vm.addMessage && (
            <Button variant="ghost" size="sm" onClick={() => vm.addMessage(path)}>
              <Plus size={12} /> Message
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => vm.addGroup(path)}>
            <Plus size={12} /> Groupe
          </Button>
        </div>
      </div>
    );
  }

  // ── Event condition ───────────────────────────────────────────────────────
  if (node.kind === "event") {
    const eo = vm.eventOptions;
    return (
      <div className="space-y-3 rounded-md border border-[#E5E7EB] bg-white p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#8BAFC0]">
            Événement
          </span>
          <div className="w-44">
            <Select
              value={String(node.occurred)}
              onChange={(e) => vm.updateNode(path, { occurred: e.target.value === "true" })}
              options={[
                { value: "true", label: "a reçu" },
                { value: "false", label: "n'a pas reçu" },
              ]}
            />
          </div>
          <div className="min-w-[220px] flex-1">
            <Select
              value={node.code}
              onChange={(e) => vm.updateNode(path, { code: e.target.value })}
              options={[
                { value: "", label: "Choisir un événement…" },
                ...(vm.events ?? []).map((ev: any) => ({
                  value: ev.code ?? "",
                  label: ev.label ? `${ev.label} (${ev.code})` : ev.code ?? "",
                })),
              ]}
            />
          </div>
          <button
            onClick={() => vm.removeNode(path)}
            className="ml-auto shrink-0 p-2 text-[#8BAFC0] transition-colors hover:text-[#DC2626]"
            title="Supprimer la condition"
          >
            <Trash2 size={14} />
          </button>
        </div>
        <TemporalControls
          node={node}
          path={path}
          vm={vm}
          countLabel="Fréquence (nombre de fois)"
          countOps={eo?.countOperators ?? DEFAULT_COUNT_OPS}
          recencyOps={eo?.recencyOperators ?? DEFAULT_RECENCY_OPS}
          boundaries={eo?.boundaries ?? DEFAULT_BOUNDARIES}
          statuses={eo?.statuses ?? undefined}
        />
      </div>
    );
  }

  // ── Tag condition ─────────────────────────────────────────────────────────
  if (node.kind === "tag") {
    return (
      <div className="rounded-md border border-[#E5E7EB] bg-white p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#8BAFC0]">
            Tag
          </span>
          <Select
            value={String(node.has)}
            onChange={(e) => vm.updateNode(path, { has: e.target.value === "true" })}
            options={[
              { value: "true", label: "a le tag" },
              { value: "false", label: "n'a pas le tag" },
            ]}
          />
          <Select
            value={node.name}
            onChange={(e) => vm.updateNode(path, { name: e.target.value })}
            options={[
              { value: "", label: "Choisir un tag…" },
              ...(vm.tags ?? []).map((t: any) => ({
                value: t.name ?? "",
                label: t.name ?? "",
              })),
            ]}
          />
          <button
            onClick={() => vm.removeNode(path)}
            className="ml-auto shrink-0 p-2 text-[#8BAFC0] transition-colors hover:text-[#DC2626]"
            title="Supprimer la condition"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    );
  }

  // ── Message condition ─────────────────────────────────────────────────────
  if (node.kind === "message") {
    const mo = vm.messageOptions;
    const opt = (v?: string | null, l?: string | null) => ({
      value: v ?? "",
      label: l ?? v ?? "",
    });
    return (
      <div className="space-y-2 rounded-md border border-[#E5E7EB] bg-white p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#8BAFC0]">
            Message
          </span>
          <div className="w-44">
            <Select
              value={String(node.occurred)}
              onChange={(e) => vm.updateNode(path, { occurred: e.target.value === "true" })}
              options={[
                { value: "true", label: "Respecte le critère" },
                { value: "false", label: "Négation (aucun)" },
              ]}
            />
          </div>
          <div className="min-w-[220px] flex-1">
            <Select
              value={node.direction ?? ""}
              onChange={(e) =>
                vm.updateNode(path, { direction: e.target.value || undefined })
              }
              options={[
                opt("", "Reçu ou envoyé (les deux)"),
                ...(mo?.directions ?? [
                  { code: "OUTBOUND", label: "A reçu (message sortant)" },
                  { code: "INBOUND", label: "A envoyé / répondu (message entrant)" },
                ]).map((d) => opt(d.code, d.label)),
              ]}
            />
          </div>
          <button
            onClick={() => vm.removeNode(path)}
            className="ml-auto shrink-0 p-2 text-[#8BAFC0] transition-colors hover:text-[#DC2626]"
            title="Supprimer la condition"
          >
            <Trash2 size={14} />
          </button>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <Select
            value={node.channelCode ?? ""}
            onChange={(e) =>
              vm.updateNode(path, { channelCode: e.target.value || undefined })
            }
            options={[
              opt("", "Tous les canaux"),
              ...(vm.channels ?? []).map((c) => opt(c.code, c.name ?? c.code)),
            ]}
          />
          <Select
            value={node.senderId ?? ""}
            onChange={(e) =>
              vm.updateNode(path, { senderId: e.target.value || undefined })
            }
            options={[
              opt("", "Tous les senders"),
              ...(vm.senders ?? []).map((s) =>
                opt(
                  s.id,
                  (s.displayName || s.address || s.id || "") +
                    (s.channelCode ? ` [${s.channelCode}]` : ""),
                ),
              ),
            ]}
          />
          <Select
            value={node.status ?? ""}
            onChange={(e) =>
              vm.updateNode(path, { status: e.target.value || undefined })
            }
            options={[
              opt("", "Tous les statuts"),
              ...(mo?.statuses ?? []).map((s) => opt(s.code, s.label)),
            ]}
          />
          <Select
            value={node.messageType ?? ""}
            onChange={(e) =>
              vm.updateNode(path, { messageType: e.target.value || undefined })
            }
            options={[
              opt("", "Tous les types"),
              ...(mo?.messageTypes ?? []).map((t) => opt(t.code, t.label)),
            ]}
          />
          <Select
            value={node.templateId ?? ""}
            onChange={(e) =>
              vm.updateNode(path, { templateId: e.target.value || undefined })
            }
            options={[
              opt("", "Tous les templates"),
              ...(vm.templates ?? []).map((t) =>
                opt(t.id, (t.name ?? "") + (t.code ? ` (${t.code})` : "")),
              ),
            ]}
          />
        </div>

        <TemporalControls
          node={node}
          path={path}
          vm={vm}
          countLabel="Fréquence (nombre de messages)"
          countOps={mo?.countOperators ?? DEFAULT_COUNT_OPS}
          recencyOps={mo?.recencyOperators ?? DEFAULT_RECENCY_OPS}
          boundaries={DEFAULT_BOUNDARIES}
        />
      </div>
    );
  }

  // ── Leaf ──────────────────────────────────────────────────────────────────
  const attr = node.attribute ? vm.attributeByKey(node.attribute) : undefined;
  const ops = attr ? vm.operatorsFor(attr.type) : [];
  const operandKind: OperandKind = node.operator
    ? vm.operandKindFor(node.operator)
    : "none";

  return (
    <div className="rounded-md border border-[#E5E7EB] bg-white p-3">
      <div className="flex flex-wrap items-start gap-2">
        <div className="min-w-[220px] flex-1">
          <Select
            value={node.attribute}
            onChange={(e) =>
              vm.updateNode(path, {
                attribute: e.target.value,
                operator: "",
                operand: "",
              })
            }
            options={[
              { value: "", label: "Choisir un attribut…" },
              ...vm.attributes.map((a) => ({
                value: a.key,
                label: a.isNative ? `${a.label} · natif` : a.label,
              })),
            ]}
          />
        </div>

        {attr && (
          <div className="min-w-[190px] flex-1">
            <Select
              value={node.operator}
              onChange={(e) =>
                vm.updateNode(path, {
                  operator: e.target.value,
                  operand: vm.defaultOperandFor(e.target.value),
                })
              }
              options={[
                { value: "", label: "Opérateur…" },
                ...ops.map((o) => ({
                  value: o.code ?? "",
                  label: o.label ?? o.code ?? "",
                })),
              ]}
            />
          </div>
        )}

        {attr && node.operator && operandKind !== "none" && (
          <div className="min-w-[220px] flex-[2]">
            <OperandInput
              operandKind={operandKind}
              valueKind={vm.valueKindForType(attr.type)}
              options={attr.options}
              operand={node.operand}
              onChange={(operand) => vm.updateNode(path, { operand })}
            />
          </div>
        )}

        <button
          onClick={() => vm.removeNode(path)}
          className="shrink-0 p-2 text-[#8BAFC0] transition-colors hover:text-[#DC2626]"
          title="Supprimer la condition"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

/* ── Frequency / recency / temporal-window controls (event + message) ───────── */

function CheckRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex w-fit cursor-pointer items-center gap-2 text-[12.5px] font-medium text-[#4A7A94]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded"
      />
      {label}
    </label>
  );
}

function TemporalControls({
  node,
  path,
  vm,
  countLabel,
  countOps,
  recencyOps,
  boundaries,
  statuses,
}: {
  node: CriteriaEvent | CriteriaMessage;
  path: number[];
  vm: SegmentCriteriaVM;
  countLabel: string;
  countOps: string[];
  recencyOps: string[];
  boundaries: { code?: string | null; label?: string | null }[];
  /** Event only: an optional occurrence-status filter. */
  statuses?: { code?: string | null; label?: string | null }[];
}) {
  // The window mode needs its own state: choosing "range" clears both dates,
  // so it can't be re-derived from the data (empty dates ≡ "none"). Seed it
  // from whatever the node already carries (loaded segment), then own it.
  const derivedWin: "none" | "within" | "range" =
    node.withinDays != null
      ? "within"
      : node.occurredAfter || node.occurredBefore
        ? "range"
        : "none";
  const [winMode, setWinMode] = useState<"none" | "within" | "range">(derivedWin);

  const setWindow = (mode: "none" | "within" | "range") => {
    setWinMode(mode);
    vm.updateNode(path, {
      withinDays: mode === "within" ? (node.withinDays ?? 30) : undefined,
      occurredAfter: undefined,
      occurredBefore: undefined,
    });
  };

  const opsOptions = (codes: string[]) =>
    codes.map((c) => ({ value: c, label: vm.operatorLabel(c) }));

  const open =
    !!node.count ||
    !!node.recency ||
    winMode !== "none" ||
    // Status lives in the advanced panel for events only (messages show it above).
    (!!statuses && !!node.status);

  return (
    <details className="rounded-md border border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2" open={open}>
      <summary className="cursor-pointer text-[12px] font-semibold text-[#2E8FAD]">
        Options avancées (fréquence, récence, fenêtre{statuses ? ", statut" : ""})
      </summary>

      <div className="grid gap-3 pt-3 sm:grid-cols-2">
        {/* Fréquence */}
        <div className="space-y-2">
          <CheckRow
            label={countLabel}
            checked={!!node.count}
            onChange={(v) =>
              vm.updateNode(path, {
                count: v ? { operator: countOps[0] ?? "gte", value: 1 } : undefined,
              })
            }
          />
          {node.count && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex-1 min-w-[150px]">
                <Select
                  value={node.count.operator}
                  onChange={(e) =>
                    vm.updateNode(path, {
                      count: { ...node.count!, operator: e.target.value },
                    })
                  }
                  options={opsOptions(countOps)}
                />
              </div>
              <input
                type="number"
                className={`${miniInputCls} w-24`}
                value={node.count.value}
                onChange={(e) =>
                  vm.updateNode(path, {
                    count: { ...node.count!, value: Number(e.target.value) || 0 },
                  })
                }
              />
            </div>
          )}
        </div>

        {/* Récence / ancienneté */}
        <div className="space-y-2">
          <CheckRow
            label="Récence / ancienneté"
            checked={!!node.recency}
            onChange={(v) =>
              vm.updateNode(path, {
                recency: v
                  ? { boundary: boundaries[0]?.code ?? "last", operator: "gt", days: 30 }
                  : undefined,
              })
            }
          />
          {node.recency && (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex-1 min-w-[150px]">
                  <Select
                    value={node.recency.boundary}
                    onChange={(e) =>
                      vm.updateNode(path, {
                        recency: { ...node.recency!, boundary: e.target.value },
                      })
                    }
                    options={boundaries.map((b) => ({
                      value: b.code ?? "",
                      label: b.label ?? b.code ?? "",
                    }))}
                  />
                </div>
                <div className="flex-1 min-w-[150px]">
                  <Select
                    value={node.recency.operator}
                    onChange={(e) =>
                      vm.updateNode(path, {
                        recency: { ...node.recency!, operator: e.target.value },
                      })
                    }
                    options={opsOptions(recencyOps)}
                  />
                </div>
                <input
                  type="number"
                  className={`${miniInputCls} w-20`}
                  value={node.recency.days}
                  onChange={(e) =>
                    vm.updateNode(path, {
                      recency: { ...node.recency!, days: Number(e.target.value) || 0 },
                    })
                  }
                />
              </div>
              <p className="text-[11px] leading-relaxed text-[#8BAFC0]">
                L'opérateur porte sur l'âge en jours (ex. « dernière » + « &gt; » + 60
                = inactif depuis plus de 60 j).
              </p>
            </>
          )}
        </div>

        {/* Fenêtre temporelle */}
        <div className="space-y-2">
          <p className="text-[12.5px] font-medium text-[#4A7A94]">Fenêtre temporelle</p>
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-52">
              <Select
                value={winMode}
                onChange={(e) =>
                  setWindow(e.target.value as "none" | "within" | "range")
                }
                options={[
                  { value: "none", label: "Aucune limite" },
                  { value: "within", label: "Fenêtre glissante (jours)" },
                  { value: "range", label: "Plage de dates absolue" },
                ]}
              />
            </div>
            {winMode === "within" && (
              <input
                type="number"
                placeholder="depuis N jours"
                className={`${miniInputCls} w-36`}
                value={node.withinDays ?? ""}
                onChange={(e) =>
                  vm.updateNode(path, {
                    withinDays: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            )}
            {winMode === "range" && (
              <>
                <input
                  type="date"
                  className={`${miniInputCls} w-40`}
                  value={node.occurredAfter ?? ""}
                  onChange={(e) =>
                    vm.updateNode(path, { occurredAfter: e.target.value || undefined })
                  }
                />
                <span className="text-[12px] text-[#8BAFC0]">→</span>
                <input
                  type="date"
                  className={`${miniInputCls} w-40`}
                  value={node.occurredBefore ?? ""}
                  onChange={(e) =>
                    vm.updateNode(path, { occurredBefore: e.target.value || undefined })
                  }
                />
              </>
            )}
          </div>
        </div>

        {/* Statut d'occurrence (événement uniquement) */}
        {statuses && (
          <div className="space-y-2">
            <p className="text-[12.5px] font-medium text-[#4A7A94]">
              Statut de l'occurrence
            </p>
            <Select
              value={node.status ?? ""}
              onChange={(e) =>
                vm.updateNode(path, { status: e.target.value || undefined })
              }
              options={[
                { value: "", label: "(tous sauf Ignoré)" },
                ...statuses.map((s) => ({
                  value: s.code ?? "",
                  label: s.label ?? s.code ?? "",
                })),
              ]}
            />
          </div>
        )}
      </div>
    </details>
  );
}

/* ── Operand widget, driven by operandKind + the attribute's valueKind ──────── */

function OperandInput({
  operandKind,
  valueKind,
  options,
  operand,
  onChange,
}: {
  operandKind: OperandKind;
  valueKind: string;
  options?: SelectOption[];
  operand: unknown;
  onChange: (v: unknown) => void;
}) {
  const inputType =
    valueKind === "number"
      ? "number"
      : valueKind === "date"
        ? "date"
        : valueKind === "dateTime"
          ? "datetime-local"
          : "text";

  if (operandKind === "single") {
    if (options && options.length > 0)
      return (
        <Select
          value={String(operand ?? "")}
          onChange={(e) => onChange(e.target.value)}
          options={[
            { value: "", label: "Valeur…" },
            ...options.map((o) => ({
              value: o.value ?? "",
              label: o.label ?? o.value ?? "",
            })),
          ]}
        />
      );
    if (valueKind === "boolean")
      return (
        <Select
          value={String(operand ?? "")}
          onChange={(e) => onChange(e.target.value)}
          options={[
            { value: "", label: "—" },
            { value: "true", label: "Vrai" },
            { value: "false", label: "Faux" },
          ]}
        />
      );
    return (
      <Input
        type={inputType}
        placeholder="Valeur"
        value={String(operand ?? "")}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  if (operandKind === "array") {
    return <ArrayOperandInput operand={operand} onChange={onChange} />;
  }

  // range → [min, max]
  const range = Array.isArray(operand) ? (operand as string[]) : ["", ""];
  return (
    <div className="flex items-center gap-2">
      <Input
        type={inputType}
        placeholder="Min"
        value={range[0] ?? ""}
        onChange={(e) => onChange([e.target.value, range[1] ?? ""])}
      />
      <span className="text-[12px] text-[#8BAFC0]">→</span>
      <Input
        type={inputType}
        placeholder="Max"
        value={range[1] ?? ""}
        onChange={(e) => onChange([range[0] ?? "", e.target.value])}
      />
    </div>
  );
}

/* Comma-separated list input. Holds the raw typed text locally so separators
 * (", ") survive keystrokes — parsing straight to an array on every change
 * stripped the just-typed comma (["a",""] → filtered → ["a"] → "a"). The array
 * is still pushed up on every change for the wire builder; we only resync the
 * text from the external operand when the field isn't focused (initial load /
 * operator reset). */
function ArrayOperandInput({
  operand,
  onChange,
}: {
  operand: unknown;
  onChange: (v: unknown) => void;
}) {
  const external = (Array.isArray(operand) ? (operand as string[]) : []).join(", ");
  const [text, setText] = useState(external);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(external);
  }, [external, focused]);

  return (
    <Input
      placeholder="Valeurs séparées par des virgules"
      value={text}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onChange={(e) => {
        setText(e.target.value);
        onChange(
          e.target.value
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s !== ""),
        );
      }}
    />
  );
}
