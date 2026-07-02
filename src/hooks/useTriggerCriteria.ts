import { useState, useCallback, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getApiClientSegmentMetadataOptions,
  getApiProductAttributeSchemaByIdOptions,
  getApiProductAttributeSchemaMetadataOptions,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import type {
  ConditionOperatorInfo,
  LogicalOperatorInfo,
  ConditionMetadataResponse,
  ProductSchemaResponse,
  SchemaEditorMetadataResponse,
  SelectOption,
} from "@/shared/api/generated/types.gen";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";
import {
  emptyGroup,
  emptyLeaf,
  NATIVE_FIELDS,
  type CriteriaNode,
  type CriteriaAttribute,
  type CriteriaGroup,
  type OperandKind,
  type LogicalConnector,
} from "./useSegmentCriteria";

// We reuse some types and pure tree functions from useSegmentCriteria
// Note: You must export `updateNodeAt`, `emptyGroup`, `emptyLeaf` from useSegmentCriteria or just duplicate them here.
// To avoid modifying useSegmentCriteria too much, let's just duplicate the tree update logic.

export function updateNodeAt(
  node: CriteriaNode,
  path: number[],
  fn: (n: CriteriaNode) => CriteriaNode,
): CriteriaNode {
  if (path.length === 0) return fn(node);
  if (node.kind !== "group") return node;
  const [i, ...rest] = path;
  return {
    ...node,
    children: node.children.map((c, idx) =>
      idx === i ? updateNodeAt(c, rest, fn) : c,
    ),
  };
}

/* ── Parse: API wire tree (one operator per group) → editor model (flat list +
 * per-gap connectors). Mirrors useSegmentCriteria's parse so an existing
 * trigger's conditionJson round-trips into the ConditionNodeEditor correctly
 * (the previous naive JSON.parse dropped group operators and connectors). ── */

function uiLeafFromWire(w: any): CriteriaNode {
  return {
    kind: "leaf",
    attribute: typeof w?.attribute === "string" ? w.attribute : "",
    operator: typeof w?.operator === "string" ? w.operator : "",
    operand: w && "operand" in w ? w.operand : "",
  };
}

/** Items `w` contributes to an enclosing AND-run (nested ANDs inlined; an OR → one sub-group). */
function expandAndRun(w: any): CriteriaNode[] {
  if (!w || typeof w !== "object") return [];
  if (w.kind === "leaf") return [uiLeafFromWire(w)];
  if (w.kind === "group") {
    const children: any[] = Array.isArray(w.children) ? w.children : [];
    if (w.operator === "or") return [wireGroupToUi(w)];
    return children.flatMap(expandAndRun);
  }
  return [];
}

/** Flatten any wire node into one editor group (children + per-gap connectors). */
function wireGroupToUi(w: any): CriteriaGroup {
  if (!w || typeof w !== "object") return emptyGroup();
  if (w.kind === "leaf")
    return { kind: "group", children: [uiLeafFromWire(w)], connectors: [] };
  const wchildren: any[] = Array.isArray(w.children) ? w.children : [];
  if (w.operator === "or") {
    const children: CriteriaNode[] = [];
    const connectors: LogicalConnector[] = [];
    wchildren.forEach((child) => {
      expandAndRun(child).forEach((item, ii) => {
        if (children.length > 0) connectors.push(ii === 0 ? "or" : "and");
        children.push(item);
      });
    });
    return { kind: "group", children, connectors };
  }
  const items = wchildren.flatMap(expandAndRun);
  return {
    kind: "group",
    children: items,
    connectors: items.slice(1).map((): LogicalConnector => "and"),
  };
}

function parseConditionJson(raw: string | null | undefined): CriteriaGroup {
  if (!raw || !raw.trim()) return emptyGroup();
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.kind === "leaf")
      return { kind: "group", children: [uiLeafFromWire(parsed)], connectors: [] };
    if (parsed?.kind === "group") return wireGroupToUi(parsed);
  } catch {
    /* malformed — start fresh */
  }
  return emptyGroup();
}

export function useTriggerCriteria(
  productId?: string | null,
  initialJson?: string | null,
) {
  const { handleRequestError } = useErrorHandling();
  const [criteria, setCriteria] = useState<CriteriaNode>(() =>
    parseConditionJson(initialJson),
  );

  // Operators / attributeTypes / logicalOperators live on the shared condition
  // metadata (ClientSegment/metadata), NOT on the event-engine metadata — the
  // latter only carries matchRuleTypes/captures/actionTypes. Sourcing them from
  // the event metadata is what left the operator list empty.
  const condMetaQuery = useQuery({
    ...getApiClientSegmentMetadataOptions(),
    select: (res) => res?.data as ConditionMetadataResponse | undefined,
    staleTime: 5 * 60 * 1000,
  });
  // Product attribute schema → client attributes (custom + derived) selectable
  // in conditions, alongside capture.* / payload.* built by the caller.
  const schemaQuery = useQuery({
    ...getApiProductAttributeSchemaByIdOptions({ path: { id: productId ?? "" } }),
    select: (res) => res?.data as ProductSchemaResponse | undefined,
    enabled: !!productId,
  });
  const schemaMetaQuery = useQuery({
    ...getApiProductAttributeSchemaMetadataOptions(),
    select: (res) => res?.data as SchemaEditorMetadataResponse | undefined,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const q = [condMetaQuery, schemaQuery, schemaMetaQuery].find(
      (x) => x.isError && x.error,
    );
    if (q?.error) handleRequestError(q.error);
  }, [
    condMetaQuery.isError,
    condMetaQuery.error,
    schemaQuery.isError,
    schemaQuery.error,
    schemaMetaQuery.isError,
    schemaMetaQuery.error,
    handleRequestError,
  ]);

  const operators = useMemo<ConditionOperatorInfo[]>(
    () => condMetaQuery.data?.operators ?? [],
    [condMetaQuery.data],
  );
  const logicalOperators = useMemo<LogicalOperatorInfo[]>(
    () => condMetaQuery.data?.logicalOperators ?? [],
    [condMetaQuery.data],
  );
  const attributeTypes = useMemo(
    () => condMetaQuery.data?.attributeTypes ?? [],
    [condMetaQuery.data],
  );

  // Client attributes (custom + derived from the product schema + native fields).
  const clientAttributes = useMemo<CriteriaAttribute[]>(() => {
    const custom: CriteriaAttribute[] = (schemaQuery.data?.attributes ?? [])
      .filter((a) => (a.key ?? "").trim() !== "")
      .map((a) => ({
        key: a.key as string,
        label: a.label || (a.key as string),
        type: a.type != null ? String(a.type) : "Text",
        isNative: false,
        options: (a.options ?? undefined) as SelectOption[] | undefined,
      }));
    const native: CriteriaAttribute[] = NATIVE_FIELDS.map((f) => ({
      ...f,
      isNative: true,
    }));
    return [...custom, ...native];
  }, [schemaQuery.data]);

  const valueKindForType = useCallback(
    (type: string): string => {
      const t = (schemaMetaQuery.data?.types ?? []).find((x) => x.type === type);
      if (t?.valueKind) return t.valueKind;
      // Fallback mapping when the schema metadata hasn't loaded / lacks the type.
      if (type === "Integer" || type === "Decimal") return "number";
      if (type === "Date") return "date";
      if (type === "DateTime") return "dateTime";
      if (type === "Boolean") return "boolean";
      return "string";
    },
    [schemaMetaQuery.data],
  );

  const operatorsFor = useCallback(
    (type: string): ConditionOperatorInfo[] => {
      const allowed =
        attributeTypes.find((t: any) => t.type === type)?.operators ?? [];
      return allowed
        .map((code: string) => operators.find((o: ConditionOperatorInfo) => o.code === code))
        .filter((o: ConditionOperatorInfo | undefined): o is ConditionOperatorInfo => !!o);
    },
    [attributeTypes, operators],
  );

  const operandKindFor = useCallback(
    (code: string): OperandKind => {
      return (
        (operators.find((o) => o.code === code)?.operandKind as OperandKind) ??
        "single"
      );
    },
    [operators],
  );

  const defaultOperandFor = useCallback(
    (code: string): unknown => {
      const k = operandKindFor(code);
      if (k === "none") return undefined;
      if (k === "array") return [];
      if (k === "range") return ["", ""];
      return "";
    },
    [operandKindFor],
  );

  const updateNode = useCallback(
    (path: number[], patch: Record<string, unknown>) => {
      setCriteria((prev) =>
        updateNodeAt(prev, path, (n) => ({ ...n, ...patch }) as CriteriaNode),
      );
    },
    [],
  );

  const addLeaf = useCallback((path: number[]) => {
    setCriteria((prev) =>
      updateNodeAt(prev, path, (n) =>
        n.kind === "group"
          ? {
              ...n,
              children: [...n.children, emptyLeaf()],
              connectors:
                n.children.length >= 1
                  ? [...n.connectors, "and" as LogicalConnector]
                  : n.connectors,
            }
          : n,
      ),
    );
  }, []);

  const addGroup = useCallback((path: number[]) => {
    setCriteria((prev) =>
      updateNodeAt(prev, path, (n) =>
        n.kind === "group"
          ? {
              ...n,
              children: [...n.children, emptyGroup()],
              connectors:
                n.children.length >= 1
                  ? [...n.connectors, "and" as LogicalConnector]
                  : n.connectors,
            }
          : n,
      ),
    );
  }, []);

  const removeNode = useCallback((path: number[]) => {
    if (path.length === 0) return;
    const parentPath = path.slice(0, -1);
    const idx = path[path.length - 1];
    setCriteria((prev) =>
      updateNodeAt(prev, parentPath, (parent) => {
        if (parent.kind !== "group") return parent;
        const children = parent.children.filter((_, i) => i !== idx);
        const gap = Math.max(0, idx - 1);
        const connectors = parent.connectors
          .filter((_, i) => i !== gap)
          .slice(0, Math.max(0, children.length - 1));
        return { ...parent, children, connectors };
      }),
    );
  }, []);

  const setConnector = useCallback(
    (path: number[], gap: number, value: string) => {
      const conn: LogicalConnector = value === "or" ? "or" : "and";
      setCriteria((prev) =>
        updateNodeAt(prev, path, (n) => {
          if (n.kind !== "group") return n;
          const connectors = n.connectors.slice();
          connectors[gap] = conn;
          return { ...n, connectors };
        }),
      );
    },
    [],
  );

  return {
    criteria,
    clientAttributes,
    isLoading: condMetaQuery.isLoading,
    logicalOperators,
    operatorsFor,
    operandKindFor,
    defaultOperandFor,
    valueKindForType,
    updateNode,
    addLeaf,
    addGroup,
    removeNode,
    setConnector,
  };
}
