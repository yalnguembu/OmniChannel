import { useState, useMemo } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConditionNodeEditor } from "@/components/features/contacts/ConditionNodeEditor";
import { Toggle } from "@/components/ui/Toggle";
import { useTriggerCriteria } from "@/hooks/useTriggerCriteria";
import type { TriggerDto, EventDefinitionDto, EventEngineMetadataResponse } from "@/shared/api/generated/types.gen";
import type { CriteriaAttribute, CriteriaNode } from "@/hooks/useSegmentCriteria";

/* Wire format emitted to the API: exactly one operator per group. */
type WireNode =
  | { kind: "leaf"; attribute: string; operator: string; operand?: unknown }
  | { kind: "group"; operator: "and" | "or"; children: WireNode[] };

interface TriggerBuilderProps {
  event: EventDefinitionDto;
  trigger?: TriggerDto;
  metadata?: EventEngineMetadataResponse;
  onValidateCondition?: (data: any) => Promise<any>;
  onSave: (data: Partial<TriggerDto>) => Promise<void>;
  onCancel: () => void;
}

export function TriggerBuilder({ event, trigger, onValidateCondition, onSave, onCancel }: TriggerBuilderProps) {
  const [name, setName] = useState(trigger?.name || "");
  const [priority, setPriority] = useState<number>(trigger?.priority ?? 10);
  const [isActive, setIsActive] = useState(trigger?.isActive ?? true);
  const [isSaving, setIsSaving] = useState(false);

  const vm = useTriggerCriteria(event.productId, trigger?.conditionJson);

  // Selectable attributes for a condition: the event's own capture.* and
  // payload.* variables, plus the product's client attributes (native /
  // custom / derived) resolved from the schema by the ViewModel.
  const attributes = useMemo<CriteriaAttribute[]>(() => {
    const list: CriteriaAttribute[] = [];

    // capture.* — from the event's CaptureSpec. Type must use the canonical
    // schema names (Text/Integer/…) so it matches an attributeType and gets
    // operators; "String" would match nothing.
    try {
      if (event.captureSpec) {
        const spec = JSON.parse(event.captureSpec);
        spec.captures?.forEach((c: any) => {
          if (c.name) {
            list.push({
              key: `capture.${c.name}`,
              label: `Capture : ${c.name}`,
              type: c.resultType === "String" ? "Text" : c.resultType || "Text",
              isNative: false,
            });
          }
        });
      }
    } catch {
      /* malformed captureSpec — ignore */
    }

    // payload.* — parsed from the event's PayloadSchema ({ key: "type", … }).
    try {
      if (event.payloadSchema) {
        const schema = JSON.parse(event.payloadSchema);
        Object.entries(schema ?? {}).forEach(([key, rawType]) => {
          const t = String(rawType ?? "Text");
          const norm =
            t === "text" || t === "string" || t === "String"
              ? "Text"
              : t === "integer" || t === "number"
                ? "Integer"
                : t === "decimal"
                  ? "Decimal"
                  : t === "date"
                    ? "Date"
                    : t === "datetime"
                      ? "DateTime"
                      : t === "boolean"
                        ? "Boolean"
                        : t.charAt(0).toUpperCase() + t.slice(1);
          list.push({
            key: `payload.${key}`,
            label: `Payload : ${key}`,
            type: norm,
            isNative: false,
          });
        });
      }
    } catch {
      /* malformed payloadSchema — ignore */
    }

    return [...list, ...vm.clientAttributes];
  }, [event.captureSpec, event.payloadSchema, vm.clientAttributes]);

  const attributeByKey = (key: string) => attributes.find((a) => a.key === key);

  // Le viewmodel complet pour le ConditionNodeEditor
  const editorVm = {
    ...vm,
    attributes,
    attributeByKey,
  };

  // Compile the flat editor tree (children + per-gap connectors) to the API's
  // nested one-operator-per-group wire form, applying AND-before-OR precedence
  // (split each group on OR into AND-runs). Same logic as useSegmentCriteria's
  // buildWire. Incomplete leaves (no attribute/operator) are pruned; a fully
  // empty tree yields null ("always true").
  const buildWire = (node: CriteriaNode): WireNode | null => {
    if (node.kind === "leaf") {
      if (!node.attribute || !node.operator) return null;
      const kind = vm.operandKindFor(node.operator);
      const vk = vm.valueKindForType(attributeByKey(node.attribute)?.type ?? "");
      const coerce = (v: unknown): unknown => {
        if (typeof v !== "string") return v;
        if (vk === "number") {
          const n = Number(v);
          return v.trim() === "" || Number.isNaN(n) ? v : n;
        }
        if (vk === "boolean") return v === "true";
        return v;
      };
      let operand: unknown;
      if (kind === "none") operand = undefined;
      else if (kind === "array")
        operand = Array.isArray(node.operand) ? node.operand.map(coerce) : [];
      else if (kind === "range")
        operand = Array.isArray(node.operand)
          ? [coerce(node.operand[0] ?? ""), coerce(node.operand[1] ?? "")]
          : ["", ""];
      else operand = coerce(node.operand ?? "");
      return {
        kind: "leaf",
        attribute: node.attribute,
        operator: node.operator,
        ...(operand !== undefined ? { operand } : {}),
      };
    }

    const kept: { wire: WireNode; conn: "and" | "or" }[] = [];
    node.children.forEach((child, i) => {
      const w = buildWire(child);
      if (!w) return;
      const conn = i === 0 ? "and" : (node.connectors[i - 1] ?? "and");
      kept.push({ wire: w, conn });
    });
    if (kept.length === 0) return null;
    if (kept.length === 1) return kept[0].wire;

    const segments: WireNode[][] = [[kept[0].wire]];
    for (let i = 1; i < kept.length; i++) {
      if (kept[i].conn === "or") segments.push([kept[i].wire]);
      else segments[segments.length - 1].push(kept[i].wire);
    }
    const andNode = (seg: WireNode[]): WireNode =>
      seg.length === 1 ? seg[0] : { kind: "group", operator: "and", children: seg };
    if (segments.length === 1) return andNode(segments[0]);
    return { kind: "group", operator: "or", children: segments.map(andNode) };
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const wire = buildWire(vm.criteria);
      const conditionJson = wire ? JSON.stringify(wire) : null;

      if (conditionJson && onValidateCondition) {
        const valRes = await onValidateCondition({ body: { conditionJson } });
        if (valRes?.data?.isValid === false) {
          toast.error("La condition n'est pas valide.");
          return;
        }
      }

      await onSave({
        name,
        priority,
        isActive,
        conditionJson,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            label="Nom du Trigger *"
            placeholder="ex: Montant > 1000"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="w-24">
          <Input
            label="Priorité"
            type="number"
            value={priority.toString()}
            onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-md border border-[#E5E7EB] bg-[#F7F8F9] p-3 w-fit gap-6">
        <span className="text-[13px] text-[#0D2137]">Trigger actif</span>
        <Toggle checked={isActive} onChange={setIsActive} />
      </div>

      <div className="border border-[#E5E7EB] rounded-lg bg-[#F9FAFB] p-4">
        <h4 className="text-[13px] font-semibold text-[#0D2137] mb-3">
          Conditions (Criteria)
        </h4>
        <ConditionNodeEditor node={vm.criteria} path={[]} vm={editorVm as any} />
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-[#E5E7EB]">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={isSaving}>
          Annuler
        </Button>
        <Button variant="primary" size="sm" onClick={handleSave} loading={isSaving}>
          <Save size={13} />
          {trigger ? "Mettre à jour le trigger" : "Créer le trigger"}
        </Button>
      </div>
    </div>
  );
}
