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
  OperandKind,
} from "@/hooks/useSegmentCriteria";

type SegmentCriteriaVM = ReturnType<typeof useSegmentCriteria>;

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
          <Button variant="ghost" size="sm" onClick={() => vm.addGroup(path)}>
            <Plus size={12} /> Groupe
          </Button>
        </div>
      </div>
    );
  }

  // ── Event condition ───────────────────────────────────────────────────────
  if (node.kind === "event") {
    return (
      <div className="rounded-md border border-[#E5E7EB] bg-white p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#8BAFC0]">
            Événement
          </span>
          <Select
            value={String(node.occurred)}
            onChange={(e) => vm.updateNode(path, { occurred: e.target.value === "true" })}
            options={[
              { value: "true", label: "a reçu" },
              { value: "false", label: "n'a pas reçu" },
            ]}
          />
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
          <input
            type="number"
            placeholder="dans N jours (option.)"
            value={node.withinDays ?? ""}
            onChange={(e) =>
              vm.updateNode(path, {
                withinDays: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="w-40 px-3 py-2 border border-[#E5E7EB] rounded-md text-[13px] outline-none focus:border-[#2E8FAD]"
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

  // ── Leaf ──────────────────────────────────────────────────────────────────
  const attr = node.attribute ? vm.attributeByKey(node.attribute) : undefined;
  const ops = attr ? vm.operatorsFor(attr.type) : [];
  const operandKind: OperandKind = node.operator
    ? vm.operandKindFor(node.operator)
    : "none";

  return (
    <div className="rounded-md border border-[#E5E7EB] bg-white p-3">
      <div className="flex flex-wrap items-start gap-2">
        <div className="min-w-[180px] flex-1">
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
          <div className="min-w-[150px] flex-1">
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
          <div className="min-w-[180px] flex-[2]">
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
