/**
 * Campaign step contract (mirror of the backend workflow engine, per the
 * admin-console reference). A step has a `stepType` + a `startMode`, plus a
 * per-type `configJson` payload. Targeting/template live INSIDE configJson —
 * the old CampaignChannel/CampaignSegment resources were removed from the
 * contract.
 */

export const STEP_TYPES = ["RefreshClients", "SendMessage", "Wait"] as const;
export type StepType = (typeof STEP_TYPES)[number];

export const STEP_TYPE_LABELS: Record<StepType, string> = {
  RefreshClients: "Rafraîchir les clients",
  SendMessage: "Envoyer un message",
  Wait: "Attendre",
};

export const START_MODES = ["afterPrevious", "atTime", "afterEvent"] as const;
export type StartMode = (typeof START_MODES)[number];

export const START_MODE_LABELS: Record<StartMode, string> = {
  afterPrevious: "Après l'étape précédente (+ délai)",
  atTime: "À une heure précise",
  afterEvent: "Après un événement",
};

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
  code?: string;
  sourceSegmentId?: string;
  segmentId?: string;
  targetSegmentName?: string;
}

// ── SendMessage config ───────────────────────────────────────────────────────
export const TARGETING_MODES = ["stepSegment", "segment"] as const;
export type TargetingMode = (typeof TARGETING_MODES)[number];

export const TARGETING_MODE_LABELS: Record<TargetingMode, string> = {
  stepSegment: "Segment de l'étape refresh précédente",
  segment: "Segment explicite",
};

export interface SendMessageConfig {
  templateId: string;
  senderId?: string;
  targeting: { mode: TargetingMode; segmentId?: string };
}

export function defaultConfigFor(stepType: StepType): Record<string, unknown> {
  if (stepType === "RefreshClients")
    return { mode: "fetchByCode", sync: true } satisfies RefreshClientsConfig;
  if (stepType === "SendMessage")
    return { templateId: "", targeting: { mode: "stepSegment" } } as unknown as Record<string, unknown>;
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
