import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Send,
  Clock,
  Circle,
  Check,
  X,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  CalendarClock,
  Zap,
  Users,
  Hourglass,
  Filter,
  Pause,
  Play,
  Ban,
  RotateCcw,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  SkipForward,
} from "lucide-react";
import {
  getApiClientSegmentDropdownOptions,
  getApiSenderDropdownOptions,
  postApiTemplateSearchOptions,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { formatDateTime, formatRelative } from "@/lib/date";
import {
  useCampaignRunDetail,
  useCampaignStepSendSummary,
  useCampaignStepSendItems,
} from "@/hooks/useCampaignRuns";
import {
  parseConfig,
  parseDependsOn,
  computeLevels,
  STEP_TYPE_LABELS,
  STEP_TYPE_COLORS,
  REFRESH_MODE_LABELS,
  TARGETING_MODE_LABELS,
  FILTER_SOURCE_MODE_LABELS,
  DEFAULT_RUN_CONDITION,
  type StepType,
  type RefreshMode,
  type TargetingMode,
  type FilterSourceMode,
} from "./stepConfig";
import type {
  SearchCampaignStepResponse,
  CampaignStepRunResponse,
  CampaignRunSummaryResponse,
} from "@/shared/api/generated/types.gen";

/* ── Shared meta ──────────────────────────────────────────────────────────── */

type Tone = "success" | "running" | "failed" | "waiting" | "skipped" | "idle";

interface StatusMeta {
  tone: Tone;
  label: string;
  color: string;
  bg: string;
  border: string;
}

export function runStatusMeta(s?: string | null): StatusMeta {
  const v = (s || "").toLowerCase();
  if (["completed", "succeeded", "success", "done", "sent"].includes(v))
    return { tone: "success", label: "Terminé", color: "#16A34A", bg: "#DCFCE7", border: "#86EFAC" };
  if (["running", "inprogress", "in_progress", "processing", "sending", "active"].includes(v))
    return { tone: "running", label: "En cours", color: "#2E8FAD", bg: "#E8F4F8", border: "#8BD3E6" };
  if (["failed", "error", "faulted"].includes(v))
    return { tone: "failed", label: "Échoué", color: "#DC2626", bg: "#FEE2E2", border: "#FCA5A5" };
  if (["cancelled", "canceled"].includes(v))
    return { tone: "failed", label: "Annulé", color: "#DC2626", bg: "#FEE2E2", border: "#FCA5A5" };
  // Skipped isn't a failure: a dependency didn't satisfy the step's RunCondition.
  if (["skipped", "ignored"].includes(v))
    return { tone: "skipped", label: "Ignoré", color: "#6B7280", bg: "#F3F4F6", border: "#D1D5DB" };
  if (["waiting", "waitingtoken", "scheduled", "paused", "pending", "queued"].includes(v))
    return { tone: "waiting", label: v === "paused" ? "En pause" : "En attente", color: "#D97706", bg: "#FEF3C7", border: "#FCD34D" };
  return { tone: "idle", label: s || "À venir", color: "#8BAFC0", bg: "#F0F2F4", border: "#E5E7EB" };
}

/** Bulk-send header status (COMPLETED / COMPLETED_ERRORS / FAILED / …). */
function bulkStatusMeta(s?: string | null): StatusMeta {
  const v = (s || "").toUpperCase();
  if (v === "COMPLETED")
    return { tone: "success", label: "Envoi terminé", color: "#16A34A", bg: "#DCFCE7", border: "#86EFAC" };
  if (v === "COMPLETED_ERRORS")
    return { tone: "waiting", label: "Terminé avec erreurs", color: "#D97706", bg: "#FEF3C7", border: "#FCD34D" };
  if (v === "FAILED")
    return { tone: "failed", label: "Envoi échoué", color: "#DC2626", bg: "#FEE2E2", border: "#FCA5A5" };
  return runStatusMeta(s);
}

function stepMeta(stepType?: string | null) {
  const t = (stepType || "").toLowerCase();
  if (t.includes("refresh"))
    return { Icon: Users, color: STEP_TYPE_COLORS.RefreshClients, label: STEP_TYPE_LABELS.RefreshClients };
  if (t.includes("filter"))
    return { Icon: Filter, color: STEP_TYPE_COLORS.FilterSegment, label: STEP_TYPE_LABELS.FilterSegment };
  if (t.includes("send"))
    return { Icon: Send, color: STEP_TYPE_COLORS.SendMessage, label: STEP_TYPE_LABELS.SendMessage };
  if (t.includes("wait"))
    return { Icon: Hourglass, color: STEP_TYPE_COLORS.Wait, label: STEP_TYPE_LABELS.Wait };
  return { Icon: Circle, color: "#8BAFC0", label: stepType || "Étape" };
}

interface StepLookups {
  templates: Record<string, string>;
  senders: Record<string, string>;
  segments: Record<string, string>;
  /** Step id → "#n Nom", for dependency and step-segment references. */
  steps: Record<string, string>;
}

const nameOf = (map: Record<string, string>, id?: unknown): string | undefined =>
  typeof id === "string" && id ? map[id] : undefined;

/** Human summary chips describing what a step does (design view). */
function stepChips(step: SearchCampaignStepResponse, lk: StepLookups): string[] {
  const cfg = parseConfig(step.configJson);
  const t = (step.stepType || "").toLowerCase();
  const chips: string[] = [];
  if (t.includes("refresh")) {
    const mode = cfg.mode as RefreshMode | undefined;
    if (mode) chips.push(REFRESH_MODE_LABELS[mode] ?? String(mode));
    if (cfg.code) chips.push(`code ${cfg.code}`);
    const src = nameOf(lk.segments, cfg.sourceSegmentId);
    if (src) chips.push(`source : ${src}`);
    const seg = nameOf(lk.segments, cfg.segmentId);
    if (seg) chips.push(seg);
    if (cfg.targetSegmentName) chips.push(`→ ${cfg.targetSegmentName}`);
    chips.push(cfg.sync !== false ? "synchrone" : "asynchrone");
  } else if (t.includes("filter")) {
    const mode = (cfg.sourceMode as FilterSourceMode) ?? "stepSegment";
    if (mode === "segment")
      chips.push(
        `source : ${nameOf(lk.segments, cfg.sourceSegmentId) ?? "segment manquant"}`,
      );
    else
      chips.push(
        `source : ${nameOf(lk.steps, cfg.sourceStepId) ?? FILTER_SOURCE_MODE_LABELS.stepSegment}`,
      );
    chips.push(`${countCriteriaLeaves(cfg.criteriaJson)} condition(s)`);
    if (cfg.targetSegmentName) chips.push(`→ ${cfg.targetSegmentName}`);
  } else if (t.includes("send")) {
    const targeting = cfg.targeting as
      | { mode?: TargetingMode; segmentId?: string; sourceStepId?: string }
      | undefined;
    const tpl = nameOf(lk.templates, cfg.templateId);
    chips.push(tpl ?? (cfg.templateId ? "Template" : "Template manquant"));
    const snd = nameOf(lk.senders, cfg.senderId);
    if (snd) chips.push(snd);
    else if (cfg.senderId) chips.push("Expéditeur");
    const mode = targeting?.mode ?? "segment";
    if (mode === "segment")
      chips.push(
        nameOf(lk.segments, targeting?.segmentId) ?? TARGETING_MODE_LABELS.segment,
      );
    else
      chips.push(
        nameOf(lk.steps, targeting?.sourceStepId) ??
          "segment produit le plus récent",
      );
  } else if (t.includes("wait")) {
    if (step.delayMinutes != null) chips.push(`${step.delayMinutes} min`);
    else if (step.scheduledTime) chips.push(`à ${step.scheduledTime}`);
  }
  return chips;
}

/** Counts the comparison nodes of a FilterSegment criteria tree (nested JSON string). */
function countCriteriaLeaves(criteriaJson?: unknown): number {
  if (typeof criteriaJson !== "string" || !criteriaJson.trim()) return 0;
  const walk = (n: any): number => {
    if (!n || typeof n !== "object") return 0;
    if (n.kind === "group")
      return (Array.isArray(n.children) ? n.children : []).reduce(
        (sum: number, c: any) => sum + walk(c),
        0,
      );
    return 1;
  };
  try {
    return walk(JSON.parse(criteriaJson));
  } catch {
    return 0;
  }
}

/**
 * What triggers a step to begin — combines the start mode with the *effective*
 * dependencies, since the DAG (not the order) is what actually gates the step.
 */
function triggerLabel(
  step: SearchCampaignStepResponse,
  deps: string[],
  lk: StepLookups,
): { Icon: typeof Zap; text: string } {
  const m = (step.startMode || "").toLowerCase();
  const delay =
    m.includes("previous") && step.delayMinutes
      ? ` (+ ${step.delayMinutes} min)`
      : "";
  if (m.includes("time"))
    return {
      Icon: CalendarClock,
      text: step.scheduledTime ? `à ${step.scheduledTime}` : "à heure définie",
    };
  if (m.includes("event"))
    return {
      Icon: Zap,
      text: step.eventCode
        ? `sur événement ${step.eventCode}`
        : "sur événement externe",
    };
  if (deps.length === 0) return { Icon: Play, text: "au lancement" };
  // `dependsOnJson` null means "auto" — the previous step by order.
  if (parseDependsOn(step.dependsOnJson) == null)
    return { Icon: ArrowRight, text: `après la précédente${delay}` };
  const names = deps.map((d) => lk.steps[d] ?? "?");
  if (deps.length === 1)
    return { Icon: ArrowRight, text: `après ${names[0]}${delay}` };
  return {
    Icon: ArrowRight,
    text: `après ${names.join(", ")} (rejoint)${delay}`,
  };
}

function fmtDuration(start?: string | null, end?: string | null): string | null {
  if (!start || !end) return null;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (Number.isNaN(ms) || ms < 0) return null;
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

/* ── Vertical rail scaffold (runs view) ───────────────────────────────────── */

function RailRow({
  node,
  isLast,
  lineColor = "#D8DEE3",
  dashed,
  children,
}: {
  node: React.ReactNode;
  isLast?: boolean;
  lineColor?: string;
  dashed?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3.5">
      <div className="flex flex-col items-center">
        {node}
        {!isLast && (
          <div
            className="w-[2px] grow rounded-full my-1"
            style={
              dashed
                ? {
                    backgroundImage: `repeating-linear-gradient(to bottom, ${lineColor} 0 4px, transparent 4px 8px)`,
                  }
                : { background: lineColor }
            }
          />
        )}
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function StatusIcon({ tone, size = 15 }: { tone: Tone; size?: number }) {
  if (tone === "success") return <Check size={size} />;
  if (tone === "failed") return <X size={size} />;
  if (tone === "running") return <Loader2 size={size} className="animate-spin" />;
  if (tone === "waiting") return <Clock size={size} />;
  if (tone === "skipped") return <SkipForward size={size} />;
  return <Circle size={size} />;
}

function StatusDot({ meta }: { meta: StatusMeta }) {
  return (
    <span
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-sm",
        meta.tone === "running" && "shadow-[0_0_0_4px_rgba(46,143,173,0.16)] animate-pulse",
      )}
      style={{ background: meta.color }}
    >
      <StatusIcon tone={meta.tone} size={15} />
    </span>
  );
}

/* ── Design graph (Steps tab) — one column per execution level ─────────────── */

function useStepLookups(
  productId: string,
  steps: SearchCampaignStepResponse[],
): StepLookups {
  const { data: segments = [] } = useQuery({
    ...getApiClientSegmentDropdownOptions({ query: { productid: productId } }),
    select: (r) => (r?.data ?? []) as { id?: string; name?: string | null }[],
    enabled: !!productId,
  });
  const { data: senders = [] } = useQuery({
    ...getApiSenderDropdownOptions(),
    select: (r) => (r?.data ?? []) as { id?: string; name?: string | null }[],
  });
  const { data: templates = [] } = useQuery({
    ...postApiTemplateSearchOptions({ body: { productId, pageSize: 100 } as any }),
    select: (r) => (r?.data?.items ?? []) as { id?: string; name?: string | null }[],
    enabled: !!productId,
  });

  return useMemo<StepLookups>(() => {
    const toMap = (arr: { id?: string; name?: string | null }[]) =>
      Object.fromEntries(
        arr.filter((x) => x.id).map((x) => [x.id as string, x.name ?? ""]),
      );
    return {
      segments: toMap(segments),
      senders: toMap(senders),
      templates: toMap(templates),
      steps: Object.fromEntries(
        steps
          .filter((s) => s.id)
          .map((s, i) => [
            s.id as string,
            `#${i + 1} ${s.name || s.stepType || "Étape"}`,
          ]),
      ),
    };
  }, [segments, senders, templates, steps]);
}

export function CampaignStepGraph({
  steps,
  productId,
  isLoading,
  onEdit,
  onDelete,
  onAdd,
  onReorder,
}: {
  steps: SearchCampaignStepResponse[];
  productId: string;
  isLoading?: boolean;
  onEdit: (s: SearchCampaignStepResponse) => void;
  onDelete: (s: SearchCampaignStepResponse) => void;
  onAdd: () => void;
  onReorder?: (index: number, direction: -1 | 1) => void;
}) {
  const lookups = useStepLookups(productId, steps);
  const { levels, deps, hasChild } = useMemo(() => computeLevels(steps), [steps]);
  // TanStack re-runs an inline `select` whenever its identity changes — which is
  // every render — so `lookups` is a fresh object each time. Depending on it
  // directly would tear down and rebuild the ResizeObserver below on every
  // render; a value signature keeps the effect keyed on the content instead.
  const lookupsKey = JSON.stringify(lookups);

  const stageRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [edges, setEdges] = useState<string[]>([]);
  const [svgSize, setSvgSize] = useState({ w: 0, h: 0 });

  // Edges are traced from *measured* card positions rather than assumed
  // geometry, so they stay correct whatever the card heights are. A
  // ResizeObserver on the stage re-measures on anything that shifts the layout —
  // window resize, but also late arrivals that change card heights (template /
  // segment names filling the chip rows, web fonts, the sidebar collapsing).
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const measure = () => {
      const start = startRef.current;
      if (!start) return;
      const sRect = stage.getBoundingClientRect();
      const point = (el: HTMLElement, side: "l" | "r") => {
        const r = el.getBoundingClientRect();
        return {
          // Pull the incoming end back a few px so the arrowhead lands just
          // before the card instead of on top of its colour accent bar.
          x: (side === "r" ? r.right : r.left - 5) - sRect.left,
          y: r.top - sRect.top + r.height / 2,
        };
      };
      const paths: string[] = [];
      // Orthogonal elbow: out horizontally, one vertical run at the mid-gutter,
      // then back in horizontally. Both ends are axis-aligned, so `orient="auto"`
      // always lands the arrowhead pointing straight at the card — a free cubic
      // arrives at whatever slope the height difference dictates, which reads as
      // a broken, dangling arrow on tall cards.
      const curve = (
        a: { x: number; y: number },
        b: { x: number; y: number },
      ) => {
        if (Math.abs(a.y - b.y) < 2) {
          paths.push(`M${a.x},${a.y} L${b.x},${b.y}`);
          return;
        }
        const mx = (a.x + b.x) / 2;
        const dir = b.y > a.y ? 1 : -1;
        const r = Math.max(
          0,
          Math.min(10, Math.abs(b.y - a.y) / 2, mx - a.x, b.x - mx),
        );
        paths.push(
          `M${a.x},${a.y} L${mx - r},${a.y}` +
            ` Q${mx},${a.y} ${mx},${a.y + dir * r}` +
            ` L${mx},${b.y - dir * r}` +
            ` Q${mx},${b.y} ${mx + r},${b.y}` +
            ` L${b.x},${b.y}`,
        );
      };
      steps.forEach((s, i) => {
        const to = s.id ? cardRefs.current[s.id] : null;
        if (!to) return;
        const d = deps[i] ?? [];
        if (d.length === 0) curve(point(start, "r"), point(to, "l"));
        else
          d.forEach((dep) => {
            const from = cardRefs.current[dep];
            if (from) curve(point(from, "r"), point(to, "l"));
          });
      });
      // Only commit on an actual change — the observer would otherwise keep
      // firing on our own re-renders.
      setEdges((prev) =>
        prev.length === paths.length && prev.every((p, i) => p === paths[i])
          ? prev
          : paths,
      );
      setSvgSize((prev) => {
        const next = { w: stage.scrollWidth, h: stage.scrollHeight };
        return prev.w === next.w && prev.h === next.h ? prev : next;
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    Object.values(cardRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [steps, deps, levels, lookupsKey]);

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-16 text-[#8BAFC0]">
        <Loader2 className="animate-spin" size={26} />
      </div>
    );

  const maxLevel = levels.length ? Math.max(...levels) : 0;
  const columns = Array.from({ length: maxLevel + 1 }, (_, L) =>
    steps
      .map((s, i) => ({ step: s, index: i }))
      .filter(({ index }) => levels[index] === L),
  );

  return (
    <div className="rounded-[16px] border border-[#E5E7EB] bg-[#FAFBFC] p-5">
      <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#8BAFC0]">
        <span>▶ Départ → étapes racines</span>
        <span>
          Colonne = niveau d'exécution (les étapes d'une colonne démarrent en
          parallèle)
        </span>
        <span>
          <b className="text-[#16A34A]">DÉBUT</b> racine ·{" "}
          <b className="text-[#2E8FAD]">FIN</b> feuille
        </span>
      </div>

      <div className="overflow-x-auto pb-2">
        <div
          ref={stageRef}
          className="relative flex min-w-fit items-start gap-12"
        >
          {/* `left-0 top-0` and no viewBox — NOT `inset-0`: stretching the
              element to the parent box (or scaling a viewBox) would rescale
              every coordinate and skew the edges away from the cards they were
              measured against. Here 1 unit = 1px, in the stage's own frame. */}
          {edges.length > 0 && (
            <svg
              className="pointer-events-none absolute left-0 top-0 overflow-visible"
              width={svgSize.w}
              height={svgSize.h}
            >
              <defs>
                <marker
                  id="campaign-edge-arrow"
                  markerWidth="9"
                  markerHeight="9"
                  refX="7"
                  refY="3"
                  orient="auto"
                >
                  <path d="M0,0 L7,3 L0,6 Z" fill="#9FB2CC" />
                </marker>
              </defs>
              {edges.map((d, i) => (
                <path
                  key={i}
                  d={d}
                  fill="none"
                  stroke="#9FB2CC"
                  strokeWidth={2}
                  markerEnd="url(#campaign-edge-arrow)"
                />
              ))}
            </svg>
          )}

          {/* Start column */}
          <div className="relative z-10 flex shrink-0 flex-col gap-4">
            <div
              ref={startRef}
              className="flex items-center gap-2.5 rounded-[12px] border border-[#C3D2DA] bg-white px-3.5 py-3 shadow-sm"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#2E8FAD]/40 text-[#2E8FAD]">
                <Play size={14} className="ml-0.5" />
              </span>
              <div>
                <p className="text-[12.5px] font-semibold text-[#0D2137]">
                  Départ du workflow
                </p>
                <p className="text-[11px] text-[#8BAFC0]">à chaque lancement</p>
              </div>
            </div>
          </div>

          {steps.length === 0 ? (
            <button
              onClick={onAdd}
              className="relative z-10 w-[280px] shrink-0 rounded-[14px] border-2 border-dashed border-[#D8DEE3] py-6 text-[13px] font-medium text-[#8BAFC0] transition-all hover:border-[#2E8FAD]/50 hover:bg-white hover:text-[#2E8FAD]"
            >
              + Configurer la première étape
            </button>
          ) : (
            columns.map((col, L) => (
              <div
                key={L}
                className="relative z-10 flex w-[300px] shrink-0 flex-col gap-4"
              >
                {col.map(({ step, index }) => (
                  <StageCard
                    key={step.id ?? index}
                    cardRef={(el) => {
                      if (step.id) cardRefs.current[step.id] = el;
                    }}
                    step={step}
                    index={index}
                    deps={deps[index] ?? []}
                    isRoot={(deps[index] ?? []).length === 0}
                    isLeaf={!hasChild[index]}
                    lookups={lookups}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onReorder={onReorder}
                    canMoveUp={index > 0}
                    canMoveDown={index < steps.length - 1}
                  />
                ))}
              </div>
            ))
          )}
        </div>
      </div>

      {steps.length > 0 && (
        <button
          onClick={onAdd}
          className="mt-4 inline-flex items-center gap-1.5 rounded-[10px] border border-dashed border-[#D8DEE3] px-3.5 py-2 text-[12.5px] font-medium text-[#8BAFC0] transition-all hover:border-[#2E8FAD]/50 hover:bg-white hover:text-[#2E8FAD]"
        >
          <Plus size={14} /> Ajouter une étape
        </button>
      )}
    </div>
  );
}

/** `cardRef` is a plain callback prop, not `ref` — React 18 function components
 * don't receive `ref` without forwardRef, and the graph only needs the node to
 * measure edge endpoints. */
const StageCard = ({
  cardRef,
  step,
  index,
  deps,
  isRoot,
  isLeaf,
  lookups,
  onEdit,
  onDelete,
  onReorder,
  canMoveUp,
  canMoveDown,
}: {
  cardRef: (el: HTMLDivElement | null) => void;
  step: SearchCampaignStepResponse;
  index: number;
  deps: string[];
  isRoot: boolean;
  isLeaf: boolean;
  lookups: StepLookups;
  onEdit: (s: SearchCampaignStepResponse) => void;
  onDelete: (s: SearchCampaignStepResponse) => void;
  onReorder?: (index: number, direction: -1 | 1) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) => {
  const { Icon, color, label } = stepMeta(step.stepType);
  const chips = stepChips(step, lookups);
  const trig = triggerLabel(step, deps, lookups);
  const condition = step.runCondition || DEFAULT_RUN_CONDITION;

  return (
    <div
      ref={cardRef}
      role="button"
      onClick={() => onEdit(step)}
      className="group relative cursor-pointer overflow-hidden rounded-[14px] border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(13,33,55,0.05)] transition-all hover:border-[#B8CDD8] hover:shadow-[0_8px_22px_rgba(13,33,55,0.09)]"
    >
      <div className="absolute inset-y-0 left-0 w-1" style={{ background: color }} />
      <div className="flex gap-1 absolute right-2 top-2">
        {isRoot && (
          <span className="rounded-full bg-[#DCFCE7] px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-[#16A34A]">
            DÉBUT
          </span>
        )}
        {isLeaf && (
          <span className="rounded-full bg-[#E8F4F8] px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-[#2E8FAD]">
            FIN
          </span>
        )}
      </div>

      <div className="p-4 pl-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-[#8BAFC0]">
              <Icon size={11} style={{ color }} />
              Étape {index + 1} · <span style={{ color }}>{label}</span>
            </p>
            <h5 className="mt-0.5 truncate text-[14px] font-semibold text-[#0D2137]">
              {step.name || label}
            </h5>
          </div>
        </div>

        {chips.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {chips.map((chip, i) => (
              <span
                key={i}
                className="rounded-md border border-[#EEF1F3] bg-[#F7F8F9] px-2 py-0.5 text-[10.5px] font-medium text-[#4A7A94]"
              >
                {chip}
              </span>
            ))}
          </div>
        )}

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[10.5px] text-[#8BAFC0]">
          <span className="inline-flex items-center gap-1">
            <trig.Icon size={10} /> {trig.text}
          </span>
          {condition !== DEFAULT_RUN_CONDITION && (
            <span className="rounded-md bg-[#FEF3C7] px-1.5 py-0.5 font-medium text-[#B45309]">
              {condition}
            </span>
          )}
          {step.continueOnError && (
            <span className="rounded-md bg-[#FEF3C7] px-1.5 py-0.5 font-medium text-[#B45309]">
              continueOnError
            </span>
          )}
        </div>

        <div className="mt-2 flex items-center justify-end gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          {onReorder && (
            <>
              <IconBtn
                title="Monter"
                disabled={!canMoveUp}
                onClick={(e) => {
                  e.stopPropagation();
                  onReorder(index, -1);
                }}
              >
                <ArrowUp size={13} />
              </IconBtn>
              <IconBtn
                title="Descendre"
                disabled={!canMoveDown}
                onClick={(e) => {
                  e.stopPropagation();
                  onReorder(index, 1);
                }}
              >
                <ArrowDown size={13} />
              </IconBtn>
            </>
          )}
          <IconBtn
            title="Modifier"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(step);
            }}
          >
            <Pencil size={13} />
          </IconBtn>
          <IconBtn
            title="Supprimer"
            danger
            onClick={(e) => {
              e.stopPropagation();
              onDelete(step);
            }}
          >
            <Trash2 size={13} />
          </IconBtn>
        </div>
      </div>
    </div>
  );
};

function IconBtn({
  title,
  danger,
  disabled,
  onClick,
  children,
}: {
  title: string;
  danger?: boolean;
  disabled?: boolean;
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}) {
  return (
    <button
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded-md p-1.5 text-[#8BAFC0] transition-colors disabled:opacity-30",
        danger
          ? "hover:bg-[#FEE2E2] hover:text-[#DC2626]"
          : "hover:bg-[#E8F4F8] hover:text-[#2E8FAD]",
      )}
    >
      {children}
    </button>
  );
}

/* ── Send summary for one SendMessage step run ────────────────────────────── */

function SendSummaryPanel({
  stepRun,
  onResent,
}: {
  stepRun: CampaignStepRunResponse;
  onResent?: () => void;
}) {
  // The endpoint 404s until the step actually created a bulk send, so gate on
  // bulkSendId rather than eating the error.
  const enabled = !!stepRun.id && !!stepRun.bulkSendId;
  const { summary, isLoading, isError, resend, isResending } =
    useCampaignStepSendSummary(stepRun.id ?? null, { enabled });
  const [showFailed, setShowFailed] = useState(false);
  const failedItems = useCampaignStepSendItems(stepRun.id ?? null, "FAILED", {
    enabled: showFailed,
  });

  if (!enabled) return null;
  if (isLoading)
    return (
      <p className="mt-2.5 text-[11px] text-[#8BAFC0]">Chargement du résumé…</p>
    );
  if (isError || !summary)
    return (
      <p className="mt-2.5 text-[11px] text-[#8BAFC0]">
        Résumé d'envoi indisponible.
      </p>
    );

  const meta = bulkStatusMeta(summary.status);
  const failed = summary.failed ?? 0;
  const canResend =
    failed > 0 ||
    ["FAILED", "COMPLETED_ERRORS"].includes((summary.status || "").toUpperCase());

  return (
    <div className="mt-2.5 rounded-[10px] border border-[#EEF1F3] bg-[#FAFBFC] p-2.5">
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Total", value: summary.total ?? 0, color: "#0D2137" },
          { label: "Envoyés", value: summary.sent ?? 0, color: "#16A34A" },
          { label: "Échecs", value: failed, color: failed > 0 ? "#DC2626" : "#0D2137" },
          { label: "Ignorés", value: summary.skipped ?? 0, color: "#6B7280" },
        ].map((k) => (
          <div
            key={k.label}
            className="rounded-md border border-[#EEF1F3] bg-white py-1.5 text-center"
          >
            <p
              className="text-[14px] font-semibold tabular-nums"
              style={{ color: k.color }}
            >
              {k.value}
            </p>
            <p className="text-[9.5px] uppercase tracking-[0.05em] text-[#8BAFC0]">
              {k.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span
          className="rounded-full px-2 py-0.5 text-[10.5px] font-medium"
          style={{ background: meta.bg, color: meta.color }}
        >
          {meta.label}
        </span>
        {summary.source && (
          <span className="text-[10.5px] text-[#8BAFC0]">
            source : {summary.source}
          </span>
        )}
        {canResend && (
          <>
            <Button
              variant="secondary"
              size="sm"
              loading={isResending}
              onClick={async () => {
                await resend();
                onResent?.();
              }}
            >
              <RotateCcw size={12} /> Relancer les non-partis
            </Button>
            <button
              onClick={() => setShowFailed((v) => !v)}
              className="text-[10.5px] font-medium text-[#2E8FAD] hover:underline"
            >
              {showFailed ? "Masquer" : "Voir"} les échecs
            </button>
          </>
        )}
      </div>

      {summary.error && (
        <p className="mt-2 text-[10.5px] text-[#DC2626]">{summary.error}</p>
      )}

      {showFailed && (
        <div className="mt-2 max-h-48 overflow-y-auto rounded-md border border-[#EEF1F3] bg-white">
          {failedItems.isLoading ? (
            <p className="px-2.5 py-2 text-[11px] text-[#8BAFC0]">Chargement…</p>
          ) : failedItems.items.length === 0 ? (
            <p className="px-2.5 py-2 text-[11px] text-[#8BAFC0]">
              Aucun destinataire en échec.
            </p>
          ) : (
            failedItems.items.map((it) => (
              <div
                key={it.id}
                className="flex items-start justify-between gap-2 border-b border-[#F3F4F6] px-2.5 py-1.5 last:border-0"
              >
                <span className="text-[11px] tabular-nums text-[#0D2137]">
                  {it.phone || it.clientId || "—"}
                </span>
                <span className="max-w-[60%] truncate text-right text-[10.5px] text-[#DC2626]">
                  {it.error || it.status || "—"}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ── Run step card (inside an expanded execution) ─────────────────────────── */

function RunStageCard({
  step,
  onResent,
}: {
  step: CampaignStepRunResponse;
  onResent?: () => void;
}) {
  const meta = runStatusMeta(step.status);
  const { Icon, label } = stepMeta(step.stepType);
  const duration = fmtDuration(step.startedAt, step.completedAt);
  const isRunning = meta.tone === "running";
  const condition = step.runCondition || DEFAULT_RUN_CONDITION;
  return (
    <div
      className={cn(
        "mb-4 rounded-[14px] border bg-white p-4 transition-all",
        isRunning && "shadow-[0_0_0_4px_rgba(46,143,173,0.12)]",
      )}
      style={{ borderColor: meta.border }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
            style={{ background: meta.bg, color: meta.color }}
          >
            <Icon size={16} />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#8BAFC0]">
              Étape {step.stepOrder}
            </p>
            <h5 className="truncate text-[13.5px] font-semibold text-[#0D2137]">
              {STEP_TYPE_LABELS[step.stepType as StepType] ?? label}
            </h5>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span
            className="rounded-full px-2 py-0.5 text-[10.5px] font-medium"
            style={{ background: meta.bg, color: meta.color }}
          >
            {meta.label}
          </span>
          {duration && (
            <span className="text-[10.5px] tabular-nums text-[#8BAFC0]">⏱ {duration}</span>
          )}
        </div>
      </div>

      {/* The snapshot's condition explains a Skipped step, so surface it. */}
      {(condition !== DEFAULT_RUN_CONDITION || step.continueOnError) && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {condition !== DEFAULT_RUN_CONDITION && (
            <span className="rounded-md bg-[#FEF3C7] px-1.5 py-0.5 text-[10px] font-medium text-[#B45309]">
              {condition}
            </span>
          )}
          {step.continueOnError && (
            <span className="rounded-md bg-[#FEF3C7] px-1.5 py-0.5 text-[10px] font-medium text-[#B45309]">
              continueOnError
            </span>
          )}
        </div>
      )}

      {(step.startedAt || step.completedAt) && (
        <p className="mt-2 text-[11px] text-[#8BAFC0]">
          {step.startedAt ? `démarré ${formatDateTime(step.startedAt)}` : ""}
          {step.completedAt ? ` → terminé ${formatDateTime(step.completedAt)}` : ""}
        </p>
      )}

      {step.error && (
        <div className="mt-2 flex items-start gap-1.5 rounded-md bg-[#FEF2F2] px-2.5 py-1.5 text-[11px] text-[#DC2626]">
          <AlertTriangle size={12} className="mt-px shrink-0" />
          <span>{step.error}</span>
        </div>
      )}

      <SendSummaryPanel stepRun={step} onResent={onResent} />
    </div>
  );
}

function RunStepsPipeline({
  steps,
  isLoading,
  onResent,
}: {
  steps: CampaignStepRunResponse[];
  isLoading?: boolean;
  onResent?: () => void;
}) {
  if (isLoading)
    return (
      <div className="flex items-center justify-center py-6 text-[#8BAFC0]">
        <Loader2 className="animate-spin" size={20} />
      </div>
    );
  const ordered = [...steps].sort((a, b) => (a.stepOrder ?? 0) - (b.stepOrder ?? 0));
  if (ordered.length === 0)
    return (
      <p className="py-4 text-center text-[12px] text-[#8BAFC0]">
        Aucun détail d'étape pour cette exécution.
      </p>
    );
  return (
    <div>
      {ordered.map((s, i) => {
        const m = runStatusMeta(s.status);
        const isLast = i === ordered.length - 1;
        const done = m.tone === "success";
        return (
          <RailRow
            key={s.id ?? i}
            isLast={isLast}
            lineColor={done ? "#16A34A" : "#E5E7EB"}
            dashed={!done}
            node={<StatusDot meta={m} />}
          >
            <RunStageCard step={s} onResent={onResent} />
          </RailRow>
        );
      })}
    </div>
  );
}

/* ── Executions timeline (all runs, expandable) ───────────────────────────── */

function RunTimelineRow({
  run,
  isLast,
  defaultOpen,
  onPause,
  onResume,
  onCancel,
  onResendFailed,
  isMutating,
}: {
  run: CampaignRunSummaryResponse;
  isLast?: boolean;
  defaultOpen?: boolean;
  onPause?: (runId: string) => void;
  onResume?: (runId: string) => void;
  onCancel?: (runId: string) => void;
  onResendFailed?: (runId: string) => void;
  isMutating?: boolean;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  const detail = useCampaignRunDetail(open ? (run.id ?? null) : null);
  const meta = runStatusMeta(run.status);
  const steps = detail.detail?.steps ?? [];
  const total = steps.length;
  // A skipped step is terminal, so it counts as settled for the progress bar —
  // otherwise a run that finishes with skipped branches never reads as complete.
  const settled = steps.filter((s) =>
    ["success", "skipped"].includes(runStatusMeta(s.status).tone),
  ).length;
  const progress = total > 0 ? Math.round((settled / total) * 100) : 0;
  const status = (run.status || "").toLowerCase();
  const canPause = status === "running";
  const canResume = ["paused", "waitingtoken", "waiting"].includes(status);
  const canCancel = ["running", "paused", "waitingtoken", "waiting"].includes(status);

  // Whether anything is actually resendable is only knowable from the run
  // *detail* — the run's own status says nothing about which steps failed. So the
  // button stays hidden until the detail is loaded (i.e. the row is expanded)
  // and it reports at least one failed step, on a run that is no longer live.
  const isLive = ["running", "paused", "waitingtoken", "waiting"].includes(status);
  const failedSteps = steps.filter(
    (s) => runStatusMeta(s.status).tone === "failed",
  ).length;
  const detailLoaded = open && !detail.isLoading && !!detail.detail;
  const canResendFailed = detailLoaded && !isLive && failedSteps > 0;

  return (
    <RailRow isLast={isLast} lineColor="#E5E7EB" node={<StatusDot meta={meta} />}>
      <div
        className="mb-4 overflow-hidden rounded-[14px] border bg-white"
        style={{ borderColor: meta.border }}
      >
        <div
          role="button"
          onClick={() => setOpen((o) => !o)}
          className="flex cursor-pointer items-center gap-2.5 p-3.5 transition-colors hover:bg-[#F7F8F9]"
        >
          <span className="text-[#8BAFC0]">
            {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[13px] font-semibold text-[#0D2137]">
                Exécution {(run.id ?? "").slice(0, 8)}
              </span>
              <span
                className="rounded-full px-2 py-0.5 text-[10.5px] font-medium"
                style={{ background: meta.bg, color: meta.color }}
              >
                {meta.label}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-[#8BAFC0]">
              {run.trigger || "manuel"}
              {run.startedAt ? ` · démarré ${formatRelative(run.startedAt)}` : ""}
              {run.completedAt
                ? ` · durée ${fmtDuration(run.startedAt, run.completedAt) ?? "—"}`
                : ""}
            </p>
          </div>
          {open && total > 0 && (
            <span className="shrink-0 text-[11px] font-medium tabular-nums text-[#4A7A94]">
              {settled}/{total} étapes
            </span>
          )}
          <div
            className="flex shrink-0 flex-wrap items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            {canPause && onPause && run.id && (
              <Button variant="secondary" size="sm" onClick={() => onPause(run.id!)} loading={isMutating}>
                <Pause size={13} /> Pause
              </Button>
            )}
            {canResume && onResume && run.id && (
              <Button variant="secondary" size="sm" onClick={() => onResume(run.id!)} loading={isMutating}>
                <Play size={13} /> Reprendre
              </Button>
            )}
            {canCancel && onCancel && run.id && (
              <Button variant="secondary" size="sm" onClick={() => onCancel(run.id!)} loading={isMutating}>
                <Ban size={13} /> Annuler
              </Button>
            )}
            {canResendFailed && onResendFailed && run.id && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onResendFailed(run.id!)}
                loading={isMutating}
                title="Relance les étapes en échec ou partielles — les destinataires déjà envoyés sont sautés"
              >
                <RotateCcw size={13} /> Relancer {failedSteps} échec
                {failedSteps > 1 ? "s" : ""}
              </Button>
            )}
          </div>
        </div>

        {open && (
          <div className="border-t border-[#E5E7EB] bg-[#FAFBFC] p-4">
            {total > 0 && (
              <div className="mb-4 h-1 w-full overflow-hidden rounded-full bg-[#F0F2F4]">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                    background: meta.tone === "failed" ? "#DC2626" : "#16A34A",
                  }}
                />
              </div>
            )}
            <RunStepsPipeline
              steps={steps}
              isLoading={detail.isLoading}
              onResent={() => detail.refetch()}
            />
          </div>
        )}
      </div>
    </RailRow>
  );
}

export function CampaignRunsTimeline({
  runs,
  onPause,
  onResume,
  onCancel,
  onResendFailed,
  isMutating,
}: {
  runs: CampaignRunSummaryResponse[];
  onPause?: (runId: string) => void;
  onResume?: (runId: string) => void;
  onCancel?: (runId: string) => void;
  onResendFailed?: (runId: string) => void;
  isMutating?: boolean;
}) {
  return (
    <div className="rounded-[16px] border border-[#E5E7EB] bg-[#FAFBFC] p-5">
      {runs.map((r, i) => (
        <RunTimelineRow
          key={r.id ?? i}
          run={r}
          isLast={i === runs.length - 1}
          defaultOpen={i === 0}
          onPause={onPause}
          onResume={onResume}
          onCancel={onCancel}
          onResendFailed={onResendFailed}
          isMutating={isMutating}
        />
      ))}
    </div>
  );
}
