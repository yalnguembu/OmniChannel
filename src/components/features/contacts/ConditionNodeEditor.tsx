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
}: {
  node: CriteriaNode;
  path: number[];
  vm: SegmentCriteriaVM;
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
              <ConditionNodeEditor node={child} path={[...path, idx]} vm={vm} />
            </div>
          ))}
        </div>

        <div className="mt-2 flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => vm.addLeaf(path)}>
            <Plus size={12} /> Condition
          </Button>
          <Button variant="ghost" size="sm" onClick={() => vm.addGroup(path)}>
            <Plus size={12} /> Groupe
          </Button>
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
    const values = Array.isArray(operand) ? (operand as string[]) : [];
    return (
      <Input
        placeholder="Valeurs séparées par des virgules"
        value={values.join(", ")}
        onChange={(e) =>
          onChange(
            e.target.value
              .split(",")
              .map((s) => s.trim())
              .filter((s) => s !== ""),
          )
        }
      />
    );
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
