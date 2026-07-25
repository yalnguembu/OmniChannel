/**
 * Campaign step contract (mirror of the backend workflow engine, per the
 * `/campaign-editor` reference page). A step has a `stepType` + a `startMode`,
 * plus a per-type `configJson` payload. Targeting/template live INSIDE
 * configJson — the old CampaignChannel/CampaignSegment resources were removed
 * from the contract.
 *
 * Execution is a DAG, not a chain: each step declares its dependencies
 * (`dependsOn` on write / `dependsOnJson` on read), an Azure-DevOps-style
 * `runCondition` evaluated on those dependencies, and `continueOnError`.
 */

export const STEP_TYPES = [
  "SendMessage",
  "RefreshClients",
  "FilterSegment",
  "Wait",
] as const;
export type StepType = (typeof STEP_TYPES)[number];

export const STEP_TYPE_LABELS: Record<StepType, string> = {
  SendMessage: "Envoyer un message",
  RefreshClients: "Actualiser les clients",
  FilterSegment: "Filtrer un segment",
  Wait: "Attendre",
};

export const STEP_TYPE_HINTS: Record<StepType, string> = {
  SendMessage: "Template WhatsApp à un segment",
  RefreshClients: "Recalcul / fetch externe → segment",
  FilterSegment: "Filtre un segment → nouveau segment",
  Wait: "Pause / attente",
};

/** Accent colour per step type (matches the reference editor's palette). */
export const STEP_TYPE_COLORS: Record<StepType, string> = {
  SendMessage: "#2E8FAD",
  RefreshClients: "#D97706",
  FilterSegment: "#DB2777",
  Wait: "#8BAFC0",
};

export const START_MODES = ["afterPrevious", "atTime", "afterEvent"] as const;
export type StartMode = (typeof START_MODES)[number];

export const START_MODE_LABELS: Record<StartMode, string> = {
  afterPrevious: "Après les dépendances (+ délai)",
  atTime: "À une heure précise",
  afterEvent: "Sur événement externe (jeton)",
};

// ── Run conditions (evaluated on the step's dependencies) ────────────────────
export const RUN_CONDITIONS = [
  "Succeeded",
  "SucceededOrFailed",
  "Always",
  "Failed",
] as const;
export type RunCondition = (typeof RUN_CONDITIONS)[number];

export const RUN_CONDITION_LABELS: Record<RunCondition, string> = {
  Succeeded: "Seulement si les dépendances ont réussi",
  SucceededOrFailed: "Même si une dépendance a échoué (sauf annulation)",
  Always: "Toujours (même si échec / annulation)",
  Failed: "Seulement si une dépendance a échoué (rattrapage)",
};

export const DEFAULT_RUN_CONDITION: RunCondition = "Succeeded";

// ── RefreshClients config ────────────────────────────────────────────────────
export const REFRESH_MODES = ["fetchByCode", "fetchByExternalIds", "refreshSegment"] as const;
export type RefreshMode = (typeof REFRESH_MODES)[number];

export const REFRESH_MODE_LABELS: Record<RefreshMode, string> = {
  fetchByCode: "Par code (j0 / j3…)",
  fetchByExternalIds: "Par segment source (external IDs)",
  refreshSegment: "Recalculer un segment local",
};

export interface RefreshClientsConfig {
  mode: RefreshMode;
  sync: boolean;
  code?: string | null;
  sourceSegmentId?: string | null;
  segmentId?: string | null;
  targetSegmentName?: string;
}

// ── SendMessage config ───────────────────────────────────────────────────────
export const TARGETING_MODES = ["segment", "stepSegment"] as const;
export type TargetingMode = (typeof TARGETING_MODES)[number];

export const TARGETING_MODE_LABELS: Record<TargetingMode, string> = {
  segment: "Segment explicite",
  stepSegment: "Segment produit par une étape",
};

export interface SendMessageConfig {
  templateId: string | null;
  senderId?: string | null;
  targeting: {
    mode: TargetingMode;
    segmentId?: string | null;
    /** Which upstream step produced the segment to send to (stepSegment mode). */
    sourceStepId?: string;
  };
}

// ── FilterSegment config ─────────────────────────────────────────────────────
/** Source of the population a FilterSegment step narrows down. */
export const FILTER_SOURCE_MODES = ["segment", "stepSegment"] as const;
export type FilterSourceMode = (typeof FILTER_SOURCE_MODES)[number];

export const FILTER_SOURCE_MODE_LABELS: Record<FilterSourceMode, string> = {
  segment: "Segment explicite",
  stepSegment: "Segment produit par une étape",
};

export interface FilterSegmentConfig {
  sourceMode: FilterSourceMode;
  sourceSegmentId?: string | null;
  sourceStepId?: string | null;
  /** The criteria tree, itself serialised as a JSON **string** inside the config. */
  criteriaJson?: string;
  targetSegmentName?: string;
}

/** Step types that materialise a segment consumable downstream. */
export const SEGMENT_PRODUCING_STEP_TYPES: StepType[] = [
  "RefreshClients",
  "FilterSegment",
];

export function isSegmentProducing(stepType?: string | null): boolean {
  return SEGMENT_PRODUCING_STEP_TYPES.includes(stepType as StepType);
}

export function defaultConfigFor(stepType: StepType): Record<string, unknown> {
  if (stepType === "RefreshClients")
    return { mode: "refreshSegment", sync: true } satisfies RefreshClientsConfig;
  if (stepType === "SendMessage")
    return {
      templateId: "",
      targeting: { mode: "segment" },
    } as unknown as Record<string, unknown>;
  if (stepType === "FilterSegment")
    return { sourceMode: "stepSegment" } as unknown as Record<string, unknown>;
  return {};
}

export function parseConfig(configJson?: string | null): Record<string, unknown> {
  if (!configJson) return {};
  try {
    return JSON.parse(configJson);
  } catch {
    return {};
  }
}

/* ── Dependencies (DAG) ──────────────────────────────────────────────────────
 * `dependsOnJson` carries three distinct states, and the difference matters:
 *   null / absent → "auto": fall back to the step of the previous order
 *                   (backward compat with linear campaigns)
 *   "[]"          → root: starts at launch
 *   "[ids…]"      → explicit dependencies (fan-in when more than one)
 * ─────────────────────────────────────────────────────────────────────────── */

/** `dependsOnJson` → `null` (auto) | `string[]` (explicit, possibly empty). */
export function parseDependsOn(dependsOnJson?: string | null): string[] | null {
  if (dependsOnJson == null || dependsOnJson === "") return null;
  try {
    const parsed = JSON.parse(dependsOnJson);
    if (!Array.isArray(parsed)) return null;
    return parsed.filter((x): x is string => typeof x === "string" && !!x);
  } catch {
    return null;
  }
}

/**
 * Resolves a step's declared dependencies to the ids actually present in the
 * campaign: `null` (auto) becomes the previous step by order, and dangling ids
 * (a deleted step) are dropped — mirroring the engine's `effectiveDeps`.
 */
export function effectiveDeps<T extends { id?: string; dependsOnJson?: string | null }>(
  step: T,
  index: number,
  orderedSteps: T[],
): string[] {
  const declared = parseDependsOn(step.dependsOnJson);
  if (declared != null)
    return declared.filter((id) => orderedSteps.some((s) => s.id === id));
  const prev = index > 0 ? orderedSteps[index - 1]?.id : undefined;
  return prev ? [prev] : [];
}

/**
 * Topological level per step (`level = 1 + max(level of deps)`, 0 for roots).
 * Steps sharing a level have no dependency between them and run in parallel.
 * Cycles are refused by the backend; the `seen` guard only keeps a corrupted
 * payload from recursing forever.
 */
export function computeLevels<T extends { id?: string; dependsOnJson?: string | null }>(
  orderedSteps: T[],
): { levels: number[]; deps: string[][]; hasChild: boolean[] } {
  const deps = orderedSteps.map((s, i) => effectiveDeps(s, i, orderedSteps));
  const idxById = new Map<string, number>();
  orderedSteps.forEach((s, i) => {
    if (s.id) idxById.set(s.id, i);
  });

  const levels = new Array(orderedSteps.length).fill(-1);
  const levelOf = (i: number, seen: Set<number>): number => {
    if (levels[i] >= 0) return levels[i];
    if (seen.has(i)) return 0;
    seen.add(i);
    let max = -1;
    deps[i].forEach((d) => {
      const di = idxById.get(d);
      if (di != null) max = Math.max(max, levelOf(di, seen));
    });
    levels[i] = max + 1;
    return levels[i];
  };
  orderedSteps.forEach((_, i) => levelOf(i, new Set()));

  const hasChild = new Array(orderedSteps.length).fill(false);
  deps.forEach((ds) =>
    ds.forEach((d) => {
      const di = idxById.get(d);
      if (di != null) hasChild[di] = true;
    }),
  );

  return { levels, deps, hasChild };
}
