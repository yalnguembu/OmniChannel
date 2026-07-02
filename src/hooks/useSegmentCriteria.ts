import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getApiClientSegmentMetadataOptions,
  getApiProductAttributeSchemaByIdOptions,
  getApiProductAttributeSchemaMetadataOptions,
  postApiClientSegmentPreviewMutation,
  postApiClientSegmentMutation,
  putApiClientSegmentMutation,
  postApiClientSegmentRecalculateByIdMutation,
  postApiClientSegmentSearchQueryKey,
  getApiClientSegmentDropdownQueryKey,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import type {
  ConditionMetadataResponse,
  ConditionOperatorInfo,
  LogicalOperatorInfo,
  ProductSchemaResponse,
  SchemaEditorMetadataResponse,
  SelectOption,
  ClientSegmentDto,
  CreateClientSegmentRequest,
  UpdateClientSegmentRequest,
  SegmentPreviewResponse,
} from "@/shared/api/generated/types.gen";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";

/* ── Criteria tree model ──────────────────────────────────────────────────────
 * The API wire format (guide §3) is a strict tree: a group carries ONE logical
 * operator ("and" | "or") over its children, and mixing operators is expressed
 * by NESTING groups. To let users mix "ET" and "OU" at the same level, the
 * editor model instead stores a flat list of children plus a connector PER GAP,
 * and we compile that to the nested wire form by precedence (AND binds tighter
 * than OR) — see buildWire — and flatten the wire back on load — see
 * wireGroupToUi. So `x=12 ET 1<4 OU (…)` ⇒ wire `OR(AND(x=12,1<4), …)`.
 * ──────────────────────────────────────────────────────────────────────────── */

export type LogicalConnector = "and" | "or";

export type CriteriaLeaf = {
  kind: "leaf";
  attribute: string;
  operator: string;
  /** Raw operand held in editor form (string | string[] | [string,string]); omitted for none-kind operators. */
  operand?: unknown;
};
export type CriteriaGroup = {
  kind: "group";
  children: CriteriaNode[];
  /** connectors[i] joins children[i] and children[i + 1]; length === max(0, children.length - 1). */
  connectors: LogicalConnector[];
};
export type CriteriaNode = CriteriaLeaf | CriteriaGroup;

export type OperandKind = "none" | "single" | "array" | "range";

/* Wire format emitted to / read from the API (exactly one operator per group). */
type WireLeaf = {
  kind: "leaf";
  attribute: string;
  operator: string;
  operand?: unknown;
};
type WireGroup = {
  kind: "group";
  operator: LogicalConnector;
  children: WireNode[];
};
type WireNode = WireLeaf | WireGroup;

export const emptyGroup = (): CriteriaGroup => ({
  kind: "group",
  children: [],
  connectors: [],
});
export const emptyLeaf = (): CriteriaLeaf => ({
  kind: "leaf",
  attribute: "",
  operator: "",
  operand: "",
});
const emptyWireGroup = (): WireGroup => ({
  kind: "group",
  operator: "and",
  children: [],
});

/* ── Parse: wire (nested, one-operator groups) → editor model (flat + connectors)
 * Reverses the precedence compile: an OR group's AND children are inlined as an
 * AND-run, runs joined by OR. Associative same-operator nesting collapses (it is
 * indistinguishable on the wire), while a genuinely significant sub-tree (e.g. an
 * OR nested inside an AND) is preserved as a sub-group. */
function uiLeafFromWire(w: any): CriteriaLeaf {
  return {
    kind: "leaf",
    attribute: typeof w?.attribute === "string" ? w.attribute : "",
    operator: typeof w?.operator === "string" ? w.operator : "",
    operand: w && "operand" in w ? w.operand : "",
  };
}

/** Items `w` contributes to an enclosing AND-run (nested ANDs inlined; an OR → one sub-group item). */
function expandAndRun(w: any): CriteriaNode[] {
  if (!w || typeof w !== "object") return [];
  if (w.kind === "leaf") return [uiLeafFromWire(w)];
  if (w.kind === "group") {
    const children: any[] = Array.isArray(w.children) ? w.children : [];
    if (w.operator === "or") return [wireGroupToUi(w)];
    return children.flatMap(expandAndRun); // "and" (or unknown) → inline
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
  const items = wchildren.flatMap(expandAndRun); // "and"
  return {
    kind: "group",
    children: items,
    connectors: items.slice(1).map((): LogicalConnector => "and"),
  };
}

/** Tolerant parse of a stored `criteria` string → editor tree (root is always a group). */
function parseCriteria(raw: string | null | undefined): CriteriaGroup {
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

/** Immutable update at `path` (list of child indices from the root). */
function updateNodeAt(
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

/* ── Native client fields, typed per guide §5 ───────────────────────────────── */

export const NATIVE_FIELDS: { key: string; label: string; type: string }[] = [
  { key: "externalId", label: "ID externe", type: "Text" },
  { key: "email", label: "Email", type: "Email" },
  { key: "phone", label: "Téléphone", type: "Phone" },
  { key: "firstName", label: "Prénom", type: "Text" },
  { key: "lastName", label: "Nom", type: "Text" },
  { key: "gender", label: "Genre", type: "Text" },
  { key: "birthDate", label: "Date de naissance", type: "Date" },
  { key: "language", label: "Langue", type: "Text" },
  { key: "timezone", label: "Fuseau horaire", type: "Text" },
  { key: "address", label: "Adresse", type: "Text" },
  { key: "city", label: "Ville", type: "Text" },
  { key: "postalCode", label: "Code postal", type: "Text" },
  { key: "country", label: "Pays", type: "Text" },
  { key: "status", label: "Statut", type: "Text" },
  { key: "createdAt", label: "Créé le", type: "DateTime" },
];

export type CriteriaAttribute = {
  key: string;
  label: string;
  type: string;
  isNative: boolean;
  options?: SelectOption[];
};

/**
 * ViewModel for the segment criteria builder (§3).
 *   - GET  /api/ClientSegment/metadata               (operators / attributeTypes / and-or)
 *   - GET  /api/Product/attribute-schema/{id}         (custom + derived attributes)
 *   - POST /api/ClientSegment/preview                 (criteria inline → matched count)
 *   - POST /api/ClientSegment | PUT                   (criteria as JSON string)
 *   - POST /api/ClientSegment/recalculate/{id}        (persist members)
 */
export function useSegmentCriteria(
  productId: string,
  segment?: ClientSegmentDto | null,
  options?: { enabled?: boolean },
) {
  const enabled = options?.enabled ?? true;
  const queryClient = useQueryClient();
  const { handleRequestError, createMutationErrorHandler } = useErrorHandling();

  // ── Metadata + schema ────────────────────────────────────────────────────────
  const condMetaQuery = useQuery({
    ...getApiClientSegmentMetadataOptions(),
    select: (res) => res?.data as ConditionMetadataResponse | undefined,
    staleTime: 5 * 60 * 1000,
    enabled,
  });
  const schemaQuery = useQuery({
    ...getApiProductAttributeSchemaByIdOptions({ path: { id: productId } }),
    select: (res) => res?.data as ProductSchemaResponse | undefined,
    enabled: !!productId && enabled,
  });
  const schemaMetaQuery = useQuery({
    ...getApiProductAttributeSchemaMetadataOptions(),
    select: (res) => res?.data as SchemaEditorMetadataResponse | undefined,
    staleTime: 5 * 60 * 1000,
    enabled,
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

  const condMeta = condMetaQuery.data;
  const operators = useMemo<ConditionOperatorInfo[]>(
    () => condMeta?.operators ?? [],
    [condMeta],
  );
  const logicalOperators = useMemo<LogicalOperatorInfo[]>(
    () => condMeta?.logicalOperators ?? [],
    [condMeta],
  );
  const attributeTypes = useMemo(
    () => condMeta?.attributeTypes ?? [],
    [condMeta],
  );

  const valueKindForType = useCallback(
    (type: string): string => {
      const t = (schemaMetaQuery.data?.types ?? []).find((x) => x.type === type);
      return t?.valueKind ?? "string";
    },
    [schemaMetaQuery.data],
  );

  // Attribute catalog: custom + derived schema attributes (typed) + native fields.
  const attributes = useMemo<CriteriaAttribute[]>(() => {
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

  const attributeByKey = useCallback(
    (key: string) => attributes.find((a) => a.key === key),
    [attributes],
  );

  const operatorsFor = useCallback(
    (type: string): ConditionOperatorInfo[] => {
      const allowed =
        attributeTypes.find((t) => t.type === type)?.operators ?? [];
      return allowed
        .map((code) => operators.find((o) => o.code === code))
        .filter((o): o is ConditionOperatorInfo => !!o);
    },
    [attributeTypes, operators],
  );

  const operandKindFor = useCallback(
    (code: string): OperandKind =>
      (operators.find((o) => o.code === code)?.operandKind as OperandKind) ??
      "single",
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

  // ── Tree + segment-field state ────────────────────────────────────────────────
  const [criteria, setCriteria] = useState<CriteriaNode>(emptyGroup());
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isDynamic, setIsDynamic] = useState(true);
  const [preview, setPreview] = useState<SegmentPreviewResponse | null>(null);

  // Seed from the segment being edited (or reset for a new one).
  useEffect(() => {
    setName(segment?.name ?? "");
    setDescription(segment?.description ?? "");
    setIsDynamic(segment?.isDynamic ?? true);
    setCriteria(parseCriteria(segment?.criteria));
    setPreview(null);
  }, [segment]);

  // ── Tree edit handlers (by path) ──────────────────────────────────────────────
  const updateNode = useCallback(
    (path: number[], patch: Record<string, unknown>) => {
      setCriteria((prev) =>
        updateNodeAt(prev, path, (n) => ({ ...n, ...patch }) as CriteriaNode),
      );
      setPreview(null);
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
    setPreview(null);
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
    setPreview(null);
  }, []);

  const removeNode = useCallback((path: number[]) => {
    if (path.length === 0) return; // never remove the root
    const parentPath = path.slice(0, -1);
    const idx = path[path.length - 1];
    setCriteria((prev) =>
      updateNodeAt(prev, parentPath, (parent) => {
        if (parent.kind !== "group") return parent;
        const children = parent.children.filter((_, i) => i !== idx);
        // Drop the gap adjacent to the removed child; keep length in sync.
        const gap = Math.max(0, idx - 1);
        const connectors = parent.connectors
          .filter((_, i) => i !== gap)
          .slice(0, Math.max(0, children.length - 1));
        return { ...parent, children, connectors };
      }),
    );
    setPreview(null);
  }, []);

  /** Change the connector in `gap` (between children[gap] and children[gap + 1]) of the group at `path`. */
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
      setPreview(null);
    },
    [],
  );

  // ── Build wire criteria: prune incomplete leaves, coerce operands by type ──────
  const buildWire = useCallback(
    (node: CriteriaNode): WireNode | null => {
      if (node.kind === "leaf") {
        if (!node.attribute || !node.operator) return null;
        const kind = operandKindFor(node.operator);
        const vk = valueKindForType(attributeByKey(node.attribute)?.type ?? "");
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

      // Group → keep built children with the connector joining each to the
      // previous kept one, then compile to nested and/or groups by precedence
      // (AND binds tighter than OR): split on OR into AND-runs.
      const kept: { wire: WireNode; conn: LogicalConnector }[] = [];
      node.children.forEach((child, i) => {
        const w = buildWire(child);
        if (!w) return;
        const conn: LogicalConnector =
          i === 0 ? "and" : (node.connectors[i - 1] ?? "and");
        kept.push({ wire: w, conn });
      });
      if (kept.length === 0) return emptyWireGroup();
      if (kept.length === 1) return kept[0].wire;

      const segments: WireNode[][] = [[kept[0].wire]];
      for (let i = 1; i < kept.length; i++) {
        if (kept[i].conn === "or") segments.push([kept[i].wire]);
        else segments[segments.length - 1].push(kept[i].wire);
      }
      const andNode = (seg: WireNode[]): WireNode =>
        seg.length === 1
          ? seg[0]
          : { kind: "group", operator: "and", children: seg };
      if (segments.length === 1) return andNode(segments[0]);
      return { kind: "group", operator: "or", children: segments.map(andNode) };
    },
    [operandKindFor, valueKindForType, attributeByKey],
  );

  // ── Preview / save / recalculate ──────────────────────────────────────────────
  const previewMutation = useMutation({
    ...postApiClientSegmentPreviewMutation(),
    onError: createMutationErrorHandler({
      toastMessage: "Erreur lors du test du critère",
    }),
  });
  const createMutation = useMutation({
    ...postApiClientSegmentMutation(),
    onError: createMutationErrorHandler(),
  });
  const updateMutation = useMutation({
    ...putApiClientSegmentMutation(),
    onError: createMutationErrorHandler(),
  });
  const recalcMutation = useMutation({
    ...postApiClientSegmentRecalculateByIdMutation(),
    onError: createMutationErrorHandler({
      toastMessage: "Erreur lors du recalcul",
    }),
  });

  const handlePreview = useCallback(async () => {
    const wire = buildWire(criteria) ?? emptyWireGroup();
    try {
      const res = await previewMutation.mutateAsync({
        body: { productId, criteria: wire, take: 50 },
      });
      const result = ((res as any)?.data ?? null) as SegmentPreviewResponse | null;
      setPreview(result);
      return result;
    } catch {
      return null;
    }
  }, [buildWire, criteria, previewMutation, productId]);

  const handleSave = useCallback(
    async (onSaved?: () => void) => {
      if (!name.trim()) {
        toast.error("Le nom du segment est requis");
        return;
      }
      const criteriaStr = JSON.stringify(buildWire(criteria) ?? emptyWireGroup());
      const onSuccess = () => {
        queryClient.invalidateQueries({
          queryKey: postApiClientSegmentSearchQueryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: getApiClientSegmentDropdownQueryKey(),
        });
        toast.success(segment?.id ? "Segment mis à jour" : "Segment créé");
        onSaved?.();
      };
      if (segment?.id) {
        const body: UpdateClientSegmentRequest = {
          id: segment.id,
          productId,
          name: name.trim(),
          description: description.trim(),
          isDynamic,
          criteria: criteriaStr,
        };
        const res = await updateMutation.mutateAsync({ body });
        if ((res as any)?.success) onSuccess();
      } else {
        const body: CreateClientSegmentRequest = {
          productId,
          name: name.trim(),
          description: description.trim(),
          isDynamic,
          criteria: criteriaStr,
          clientCount: 0,
        };
        const res = await createMutation.mutateAsync({ body });
        if ((res as any)?.success) onSuccess();
      }
    },
    [
      name,
      description,
      isDynamic,
      buildWire,
      criteria,
      segment,
      productId,
      updateMutation,
      createMutation,
      queryClient,
    ],
  );

  const handleRecalculate = useCallback(async () => {
    if (!segment?.id) return;
    const res = await recalcMutation.mutateAsync({ path: { id: segment.id } });
    if ((res as any)?.success) {
      queryClient.invalidateQueries({
        queryKey: postApiClientSegmentSearchQueryKey(),
      });
      toast.success("Membres recalculés");
    }
  }, [segment, recalcMutation, queryClient]);

  return {
    isLoading:
      condMetaQuery.isLoading ||
      schemaQuery.isLoading ||
      schemaMetaQuery.isLoading,

    // Catalog + metadata
    attributes,
    attributeByKey,
    logicalOperators,
    operatorsFor,
    operandKindFor,
    defaultOperandFor,
    valueKindForType,

    // Tree
    criteria,
    updateNode,
    addLeaf,
    addGroup,
    removeNode,
    setConnector,

    // Segment fields
    name,
    setName,
    description,
    setDescription,
    isDynamic,
    setIsDynamic,

    // Preview / save / recalc
    preview,
    handlePreview,
    isPreviewing: previewMutation.isPending,
    handleSave,
    isSaving: createMutation.isPending || updateMutation.isPending,
    handleRecalculate,
    isRecalculating: recalcMutation.isPending,
    isEditing: !!segment?.id,
  };
}
