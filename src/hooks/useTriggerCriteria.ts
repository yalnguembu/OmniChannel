import { useState, useCallback, useMemo } from "react";
import type {
  ConditionOperatorInfo,
  LogicalOperatorInfo,
  EventEngineMetadataResponse,
} from "@/shared/api/generated/types.gen";
import {
  emptyGroup,
  emptyLeaf,
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

export function useTriggerCriteria(
  metadata?: EventEngineMetadataResponse,
  initialJson?: string | null,
) {
  const [criteria, setCriteria] = useState<CriteriaNode>(() => {
    if (initialJson) {
      try {
        const parsed = JSON.parse(initialJson);
        // Basic tolerant parse
        return parsed.kind === "group"
          ? parsed
          : { kind: "group", children: [parsed], connectors: [] };
      } catch {
        return emptyGroup();
      }
    }
    return emptyGroup();
  });

  const operators = useMemo<ConditionOperatorInfo[]>(
    () => (metadata as any)?.operators ?? [],
    [metadata],
  );
  const logicalOperators = useMemo<LogicalOperatorInfo[]>(
    () => (metadata as any)?.logicalOperators ?? [],
    [metadata],
  );
  const attributeTypes = useMemo(
    () => (metadata as any)?.attributeTypes ?? [],
    [metadata],
  );

  const valueKindForType = useCallback((type: string): string => {
    // Basic mapping since we don't have schemaMetaQuery here
    if (type === "Integer" || type === "Decimal") return "number";
    if (type === "Date") return "date";
    if (type === "DateTime") return "dateTime";
    if (type === "Boolean") return "boolean";
    return "string";
  }, []);

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
