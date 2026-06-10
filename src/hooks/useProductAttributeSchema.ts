import { useState, useCallback, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getApiProductAttributeSchemaMetadataOptions,
  getApiProductAttributeSchemaByIdOptions,
  getApiProductAttributeSchemaByIdQueryKey,
  getApiProductClientMappingByIdOptions,
  getApiProductClientMappingByIdQueryKey,
  putApiProductAttributeSchemaMutation,
  putApiProductClientMappingMutation,
  postApiProductAttributeSchemaValidateMutation,
  postApiProductAttributeSchemaImpactByIdMutation,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";
import type {
  ProductSchemaResponse,
  ProductClientMappingResponse,
  SchemaEditorMetadataResponse,
  AttributeTypeFieldsInfo,
  ValidationResultResponse,
  SchemaImpactResponse,
  AttributeDefinition,
  SelectOption,
  UpdateProductClientMappingRequest,
} from "@/shared/api/generated/types.gen";

/**
 * UI-side attribute shape used by the schema editor.
 *
 * `type` is modelled as a **string** (the metadata type name, e.g. "Text",
 * "Number", "Select"…). The generated `AttributeDefinition.type` is declared as
 * the numeric enum `CustomAttributeType`, but the wire format is the string name
 * (the `metadata.types[].type` identifier) — a Swashbuckle/enum-serialization
 * artifact. We keep it as a string here and cast back at the SDK boundary.
 */
export interface DraftAttribute {
  key: string;
  label: string;
  type: string;
  required: boolean;
  defaultValue: string;
  min: number | null;
  max: number | null;
  minLength: number | null;
  maxLength: number | null;
  regex: string;
  options: SelectOption[];
  currencyCode: string;
  /** Derived (computed) attribute — not user-editable, evaluated server-side. */
  derived: boolean;
  /** Derived expression, e.g. `yearsBetween(birthDate, today())`. */
  expression: string;
}

function emptyAttribute(defaultType: string): DraftAttribute {
  return {
    key: "",
    label: "",
    type: defaultType,
    required: false,
    defaultValue: "",
    min: null,
    max: null,
    minLength: null,
    maxLength: null,
    regex: "",
    options: [],
    currencyCode: "",
    derived: false,
    expression: "",
  };
}

/** Server `AttributeDefinition` → editor draft (tolerant of string|number type). */
function fromDefinition(a: AttributeDefinition): DraftAttribute {
  return {
    key: a.key ?? "",
    label: a.label ?? "",
    type: a.type != null ? String(a.type) : "",
    required: !!a.required,
    defaultValue: a.defaultValue ?? "",
    min: a.min ?? null,
    max: a.max ?? null,
    minLength: a.minLength ?? null,
    maxLength: a.maxLength ?? null,
    regex: a.regex ?? "",
    options: (a.options ?? []) as SelectOption[],
    currencyCode: a.currencyCode ?? "",
    derived: !!a.derived || !!a.isDerived,
    expression: a.derived?.expression ?? "",
  };
}

/**
 * Editor draft → wire `AttributeDefinition`, keeping only the fields that the
 * attribute's type actually supports (driven by the metadata capabilities).
 * `type` is sent as the string name and cast to satisfy the generated enum type.
 */
function toDefinition(
  d: DraftAttribute,
  info?: AttributeTypeFieldsInfo,
): AttributeDefinition {
  const out: Record<string, unknown> = {
    key: d.key.trim(),
    label: d.label.trim(),
    // string name on the wire — see DraftAttribute note.
    type: d.type as unknown as AttributeDefinition["type"],
  };
  // Derived attribute: computed server-side — only key/label/type + the
  // expression matter; constraints / default / required don't apply.
  if (d.derived) {
    out.derived = {
      expression: d.expression.trim(),
      resultType: d.type as unknown,
    };
    return out as AttributeDefinition;
  }
  out.required = d.required;
  if (d.defaultValue) out.defaultValue = d.defaultValue;
  if (info?.supportsRange) {
    if (d.min != null) out.min = d.min;
    if (d.max != null) out.max = d.max;
  }
  if (info?.supportsLength) {
    if (d.minLength != null) out.minLength = d.minLength;
    if (d.maxLength != null) out.maxLength = d.maxLength;
  }
  if (info?.supportsRegex && d.regex) out.regex = d.regex;
  if (info?.supportsOptions && d.options.length)
    out.options = d.options.filter((o) => (o.value ?? "") !== "");
  if (info?.requiresCurrencyCode && d.currencyCode)
    out.currencyCode = d.currencyCode;
  return out as AttributeDefinition;
}

/**
 * ViewModel for the Product "Attributs" tab — covers the full attribute-schema
 * + client-mapping contract:
 *   - GET  /api/Product/attribute-schema/metadata   (editor types & rules)
 *   - GET  /api/Product/attribute-schema/{id}        (current schema)
 *   - PUT  /api/Product/attribute-schema             (save schema)
 *   - POST /api/Product/attribute-schema/validate    (validate before save)
 *   - POST /api/Product/attribute-schema/impact/{id} (impact on existing data)
 *   - GET  /api/Product/client-mapping/{id}          (import column mapping)
 *   - PUT  /api/Product/client-mapping               (save mapping)
 */
export function useProductAttributeSchema(
  productId: string,
  options?: { enabled?: boolean },
) {
  // Gate the queries so callers that mount the VM behind a closed surface (e.g.
  // the import modal) don't fetch until they're visible. Defaults to enabled so
  // the always-on SchemaTab is unaffected.
  const enabled = options?.enabled ?? true;
  const queryClient = useQueryClient();
  const { handleRequestError, createMutationErrorHandler } = useErrorHandling();

  // ── Editor metadata (available types, key pattern, reserved keys, fns) ──────
  const metadataQuery = useQuery({
    ...getApiProductAttributeSchemaMetadataOptions(),
    select: (res) => res?.data as SchemaEditorMetadataResponse | undefined,
    staleTime: 5 * 60 * 1000,
    enabled,
  });
  const metadata = metadataQuery.data;
  const types = useMemo<AttributeTypeFieldsInfo[]>(
    () => metadata?.types ?? [],
    [metadata],
  );
  const reservedKeys = useMemo(
    () => new Set((metadata?.reservedKeys ?? []).map((k) => k.toLowerCase())),
    [metadata],
  );
  const keyPattern = metadata?.keyPattern ?? null;
  const derivedFunctions = metadata?.derivedFunctions ?? [];

  const typeInfoFor = useCallback(
    (type: string) => types.find((t) => t.type === type),
    [types],
  );

  /** Client-side key validation (metadata key pattern + reserved set). */
  const keyErrorFor = useCallback(
    (key: string): string | undefined => {
      const k = key.trim();
      if (!k) return "Clé requise";
      if (reservedKeys.has(k.toLowerCase())) return "Clé réservée";
      if (keyPattern) {
        try {
          if (!new RegExp(keyPattern).test(k)) return "Format de clé invalide";
        } catch {
          /* invalid server pattern — skip client-side check */
        }
      }
      return undefined;
    },
    [reservedKeys, keyPattern],
  );

  // ── Schema query ────────────────────────────────────────────────────────────
  const schemaQuery = useQuery({
    ...getApiProductAttributeSchemaByIdOptions({ path: { id: productId } }),
    select: (res) => res?.data as ProductSchemaResponse | undefined,
    enabled: !!productId && enabled,
  });

  // ── Mapping query ───────────────────────────────────────────────────────────
  const mappingQuery = useQuery({
    ...getApiProductClientMappingByIdOptions({ path: { id: productId } }),
    select: (res) => res?.data as ProductClientMappingResponse | undefined,
    enabled: !!productId && enabled,
  });

  useEffect(() => {
    const q = [metadataQuery, schemaQuery, mappingQuery].find(
      (x) => x.isError && x.error,
    );
    if (q?.error) handleRequestError(q.error);
  }, [
    metadataQuery.isError,
    metadataQuery.error,
    schemaQuery.isError,
    schemaQuery.error,
    mappingQuery.isError,
    mappingQuery.error,
    handleRequestError,
  ]);

  // ── Local draft state ───────────────────────────────────────────────────────
  const [draftAttributes, setDraftAttributes] = useState<DraftAttribute[]>([]);
  const [draftMapping, setDraftMapping] = useState<Record<string, string>>({});

  // Validation / impact results (cleared whenever the draft changes meaningfully)
  const [validation, setValidation] = useState<ValidationResultResponse | null>(
    null,
  );
  const [impact, setImpact] = useState<SchemaImpactResponse | null>(null);

  // Sync from server once loaded.
  useEffect(() => {
    if (schemaQuery.data)
      setDraftAttributes((schemaQuery.data.attributes ?? []).map(fromDefinition));
  }, [schemaQuery.data]);

  useEffect(() => {
    if (mappingQuery.data) setDraftMapping(mappingQuery.data.mappings ?? {});
  }, [mappingQuery.data]);

  const version = schemaQuery.data?.version;

  // Build the wire attribute list once, reused by save / validate / impact.
  const buildAttributes = useCallback(
    (): AttributeDefinition[] =>
      draftAttributes.map((d) => toDefinition(d, typeInfoFor(d.type))),
    [draftAttributes, typeInfoFor],
  );

  // ── Mutations ────────────────────────────────────────────────────────────────
  const saveAttributesMutation = useMutation({
    ...putApiProductAttributeSchemaMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getApiProductAttributeSchemaByIdQueryKey({
          path: { id: productId },
        }),
      });
      setImpact(null);
      toast.success("Schéma d'attributs enregistré");
    },
    onError: createMutationErrorHandler({
      toastMessage: "Erreur lors de l'enregistrement du schéma",
    }),
  });

  const saveMappingMutation = useMutation({
    ...putApiProductClientMappingMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getApiProductClientMappingByIdQueryKey({
          path: { id: productId },
        }),
      });
      toast.success("Mapping client enregistré");
    },
    onError: createMutationErrorHandler({
      toastMessage: "Erreur lors de l'enregistrement du mapping",
    }),
  });

  const validateMutation = useMutation({
    ...postApiProductAttributeSchemaValidateMutation(),
    onError: createMutationErrorHandler({
      toastMessage: "Erreur lors de la validation",
    }),
  });

  const impactMutation = useMutation({
    ...postApiProductAttributeSchemaImpactByIdMutation(),
    onError: createMutationErrorHandler({
      toastMessage: "Erreur lors de l'analyse d'impact",
    }),
  });

  // ── Handlers — attributes ────────────────────────────────────────────────────
  const handleAddAttribute = useCallback(() => {
    setValidation(null);
    setDraftAttributes((prev) => [
      ...prev,
      emptyAttribute(types[0]?.type ?? ""),
    ]);
  }, [types]);

  const handleUpdateAttribute = useCallback(
    (index: number, patch: Partial<DraftAttribute>) => {
      setValidation(null);
      setDraftAttributes((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], ...patch };
        return next;
      });
    },
    [],
  );

  const handleRemoveAttribute = useCallback((index: number) => {
    setValidation(null);
    setDraftAttributes((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Options sub-editor (Select / MultiSelect types).
  const handleAddOption = useCallback((index: number) => {
    setDraftAttributes((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        options: [...next[index].options, { value: "", label: "" }],
      };
      return next;
    });
  }, []);

  const handleUpdateOption = useCallback(
    (index: number, optIndex: number, patch: Partial<SelectOption>) => {
      setDraftAttributes((prev) => {
        const next = [...prev];
        const options = [...next[index].options];
        options[optIndex] = { ...options[optIndex], ...patch };
        next[index] = { ...next[index], options };
        return next;
      });
    },
    [],
  );

  const handleRemoveOption = useCallback((index: number, optIndex: number) => {
    setDraftAttributes((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        options: next[index].options.filter((_, i) => i !== optIndex),
      };
      return next;
    });
  }, []);

  // ── Handlers — client mapping (keyed by attribute key → import column) ────────
  const handleUpdateMapping = useCallback((key: string, value: string) => {
    setDraftMapping((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleRemoveMapping = useCallback((key: string) => {
    setDraftMapping((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  // ── Handlers — validate / impact / save ──────────────────────────────────────
  const handleValidate = useCallback(
    async (opts?: { silent?: boolean }) => {
      try {
        const res = await validateMutation.mutateAsync({
          body: { version, attributes: buildAttributes() } as any,
        });
        const result = (res?.data ?? null) as ValidationResultResponse | null;
        setValidation(result);
        if (!opts?.silent) {
          if (result?.isValid) toast.success("Schéma valide");
          else if (result)
            toast.error(`${result.errors?.length ?? 0} erreur(s) de validation`);
        }
        return result;
      } catch {
        // Surfaced by the mutation's onError handler.
        return null;
      }
    },
    [validateMutation, version, buildAttributes],
  );

  const handleAnalyzeImpact = useCallback(
    async (sample = 50) => {
      try {
        const res = await impactMutation.mutateAsync({
          path: { id: productId },
          query: { sample },
          body: { version, attributes: buildAttributes() } as any,
        });
        const result = (res?.data ?? null) as SchemaImpactResponse | null;
        setImpact(result);
        return result;
      } catch {
        // Surfaced by the mutation's onError handler.
        return null;
      }
    },
    [impactMutation, productId, version, buildAttributes],
  );

  const handleSaveAttributes = useCallback(() => {
    saveAttributesMutation.mutate({
      // `type` is a string name; the generated body expects the numeric enum.
      body: {
        id: productId,
        version,
        attributes: buildAttributes(),
      } as any,
    });
  }, [saveAttributesMutation, productId, version, buildAttributes]);

  const handleSaveMapping = useCallback(() => {
    const body: UpdateProductClientMappingRequest = {
      id: productId,
      // Drop empty source columns so we don't persist blank mappings.
      mappings: Object.fromEntries(
        Object.entries(draftMapping).filter(([, v]) => (v ?? "").trim() !== ""),
      ),
    };
    saveMappingMutation.mutate({ body });
  }, [saveMappingMutation, productId, draftMapping]);

  // Block "Enregistrer" while the editor has client-side errors (key/label,
  // duplicate keys, derived without expression) or the last server validation
  // failed.
  const hasBlockingErrors = useMemo(() => {
    const keys = draftAttributes
      .map((a) => a.key.trim().toLowerCase())
      .filter(Boolean);
    const hasDuplicate = keys.length !== new Set(keys).size;
    const perAttr = draftAttributes.some(
      (a) =>
        keyErrorFor(a.key) !== undefined ||
        a.label.trim() === "" ||
        (a.derived && a.expression.trim() === ""),
    );
    const serverInvalid = validation != null && validation.isValid === false;
    return hasDuplicate || perAttr || serverInvalid;
  }, [draftAttributes, keyErrorFor, validation]);

  return {
    // Metadata
    types,
    reservedKeys,
    keyPattern,
    derivedFunctions,
    typeInfoFor,
    keyErrorFor,
    isMetadataLoading: metadataQuery.isLoading,

    // Schema state
    attributes: draftAttributes,
    schemaVersion: version,
    isSchemaLoading: schemaQuery.isLoading,
    isSavingSchema: saveAttributesMutation.isPending,
    hasBlockingErrors,

    // Mapping state
    mapping: draftMapping,
    isMappingLoading: mappingQuery.isLoading,
    isSavingMapping: saveMappingMutation.isPending,

    // Validation / impact
    validation,
    isValidating: validateMutation.isPending,
    impact,
    isAnalyzingImpact: impactMutation.isPending,
    clearImpact: () => setImpact(null),

    // Handlers — attributes
    handleAddAttribute,
    handleUpdateAttribute,
    handleRemoveAttribute,
    handleAddOption,
    handleUpdateOption,
    handleRemoveOption,
    // Handlers — mapping
    handleUpdateMapping,
    handleRemoveMapping,
    // Handlers — actions
    handleValidate,
    handleAnalyzeImpact,
    handleSaveAttributes,
    handleSaveMapping,
  };
}
