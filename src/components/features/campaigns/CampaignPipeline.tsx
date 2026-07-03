import { useMemo, useState } from "react";
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
  CalendarClock,
  Zap,
  Users,
  Hourglass,
  Pause,
  Play,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  getApiClientSegmentDropdownOptions,
  getApiSenderDropdownOptions,
  postApiTemplateSearchOptions,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { formatDateTime, formatRelative } from "@/lib/date";
import { useCampaignRunDetail } from "@/hooks/useCampaignRuns";
import {
  parseConfig,
  STEP_TYPE_LABELS,
  REFRESH_MODE_LABELS,
  TARGETING_MODE_LABELS,
  type StepType,
  type RefreshMode,
  type TargetingMode,
} from "./stepConfig";
import type {
  SearchCampaignStepResponse,
  CampaignStepRunResponse,
  CampaignRunSummaryResponse,
} from "@/shared/api/generated/types.gen";

/* ── Shared meta ──────────────────────────────────────────────────────────── */

type Tone = "success" | "running" | "failed" | "waiting" | "idle";

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
  if (["failed", "error", "faulted", "cancelled", "canceled"].includes(v))
    return { tone: "failed", label: "Échoué", color: "#DC2626", bg: "#FEE2E2", border: "#FCA5A5" };
  if (["waiting", "waitingtoken", "scheduled", "paused", "pending", "queued"].includes(v))
    return { tone: "waiting", label: v === "paused" ? "En pause" : "En attente", color: "#D97706", bg: "#FEF3C7", border: "#FCD34D" };
  return { tone: "idle", label: s || "À venir", color: "#8BAFC0", bg: "#F0F2F4", border: "#E5E7EB" };
}

function stepMeta(stepType?: string | null) {
  const t = (stepType || "").toLowerCase();
  if (t.includes("refresh"))
    return { Icon: Users, color: "#7C3AED", label: STEP_TYPE_LABELS.RefreshClients };
  if (t.includes("send"))
    return { Icon: Send, color: "#2E8FAD", label: STEP_TYPE_LABELS.SendMessage };
  if (t.includes("wait"))
    return { Icon: Hourglass, color: "#D97706", label: STEP_TYPE_LABELS.Wait };
  return { Icon: Circle, color: "#8BAFC0", label: stepType || "Étape" };
}

interface StepLookups {
  templates: Record<string, string>;
  senders: Record<string, string>;
  segments: Record<string, string>;
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
    chips.push(cfg.sync ? "synchrone" : "asynchrone");
  } else if (t.includes("send")) {
    const targeting = cfg.targeting as
      | { mode?: TargetingMode; segmentId?: string }
      | undefined;
    const tpl = nameOf(lk.templates, cfg.templateId);
    chips.push(tpl ?? (cfg.templateId ? "Template" : "Template manquant"));
    const snd = nameOf(lk.senders, cfg.senderId);
    if (snd) chips.push(snd);
    else if (cfg.senderId) chips.push("Expéditeur");
    if (targeting?.mode)
      chips.push(TARGETING_MODE_LABELS[targeting.mode] ?? String(targeting.mode));
    if (targeting?.mode === "segment") {
      const tseg = nameOf(lk.segments, targeting.segmentId);
      if (tseg) chips.push(tseg);
    }
  } else if (t.includes("wait")) {
    if (step.delayMinutes != null) chips.push(`${step.delayMinutes} min`);
    else if (step.scheduledTime) chips.push(`à ${step.scheduledTime}`);
  }
  return chips;
}

/** What triggers a step to begin. */
function triggerLabel(step: SearchCampaignStepResponse): { Icon: typeof Zap; text: string } {
  const m = (step.startMode || "").toLowerCase();
  if (m.includes("time"))
    return { Icon: CalendarClock, text: step.scheduledTime ? `à ${step.scheduledTime}` : "à heure fixe" };
  if (m.includes("event"))
    return { Icon: Zap, text: step.eventCode ? `événement ${step.eventCode}` : "sur événement" };
  return {
    Icon: ArrowRight,
    text: step.delayMinutes ? `+ ${step.delayMinutes} min après la précédente` : "juste après la précédente",
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

/* ── Vertical rail scaffold ───────────────────────────────────────────────── */

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

function EndpointDot({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-sm"
      style={{ borderColor: `${color}66`, color }}
    >
      {children}
    </span>
  );
}

function StatusIcon({ tone, size = 15 }: { tone: Tone; size?: number }) {
  if (tone === "success") return <Check size={size} />;
  if (tone === "failed") return <X size={size} />;
  if (tone === "running") return <Loader2 size={size} className="animate-spin" />;
  if (tone === "waiting") return <Clock size={size} />;
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

/* ── Design pipeline (Steps tab) — vertical ───────────────────────────────── */

export function CampaignStepGraph({
  steps,
  productId,
  isLoading,
  onEdit,
  onDelete,
  onAdd,
}: {
  steps: SearchCampaignStepResponse[];
  productId: string;
  isLoading?: boolean;
  onEdit: (s: SearchCampaignStepResponse) => void;
  onDelete: (s: SearchCampaignStepResponse) => void;
  onAdd: () => void;
}) {
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

  const lookups = useMemo<StepLookups>(() => {
    const toMap = (arr: { id?: string; name?: string | null }[]) =>
      Object.fromEntries(
        arr.filter((x) => x.id).map((x) => [x.id as string, x.name ?? ""]),
      );
    return { segments: toMap(segments), senders: toMap(senders), templates: toMap(templates) };
  }, [segments, senders, templates]);

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-16 text-[#8BAFC0]">
        <Loader2 className="animate-spin" size={26} />
      </div>
    );

  return (
    <div className="rounded-[16px] border border-[#E5E7EB] bg-[#FAFBFC] p-5">
      <RailRow
        node={
          <EndpointDot color="#2E8FAD">
            <Play size={15} className="ml-0.5" />
          </EndpointDot>
        }
        lineColor="#C3D2DA"
      >
        <div className="pb-5 pt-1.5">
          <p className="text-[12.5px] font-semibold text-[#0D2137]">
            Départ du workflow
          </p>
          <p className="text-[11.5px] text-[#8BAFC0]">
            Exécuté à chaque lancement de la campagne.
          </p>
        </div>
      </RailRow>

      {steps.length === 0 ? (
        <RailRow isLast node={<AddDot />}>
          <button
            onClick={onAdd}
            className="mb-1 w-full rounded-[14px] border-2 border-dashed border-[#D8DEE3] py-6 text-[13px] font-medium text-[#8BAFC0] transition-all hover:border-[#2E8FAD]/50 hover:bg-white hover:text-[#2E8FAD]"
          >
            + Configurer la première étape
          </button>
        </RailRow>
      ) : (
        <>
          {steps.map((s, i) => {
            const { Icon, color } = stepMeta(s.stepType);
            return (
              <RailRow
                key={s.id ?? i}
                node={
                  <EndpointDot color={color}>
                    <Icon size={15} />
                  </EndpointDot>
                }
              >
                <StageCard
                  step={s}
                  index={i}
                  lookups={lookups}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </RailRow>
            );
          })}
          <RailRow isLast node={<AddDot />}>
            <button
              onClick={onAdd}
              className="inline-flex items-center gap-1.5 rounded-[10px] border border-dashed border-[#D8DEE3] px-3.5 py-2 text-[12.5px] font-medium text-[#8BAFC0] transition-all hover:border-[#2E8FAD]/50 hover:bg-white hover:text-[#2E8FAD]"
            >
              <Plus size={14} /> Ajouter une étape
            </button>
          </RailRow>
        </>
      )}
    </div>
  );
}

function AddDot() {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-[#D8DEE3] bg-white text-[#8BAFC0]">
      <Plus size={15} />
    </span>
  );
}

function StageCard({
  step,
  index,
  lookups,
  onEdit,
  onDelete,
}: {
  step: SearchCampaignStepResponse;
  index: number;
  lookups: StepLookups;
  onEdit: (s: SearchCampaignStepResponse) => void;
  onDelete: (s: SearchCampaignStepResponse) => void;
}) {
  const { color, label } = stepMeta(step.stepType);
  const chips = stepChips(step, lookups);
  const trig = triggerLabel(step);
  return (
    <div className="group mb-5">
      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] text-[#8BAFC0]">
        <trig.Icon size={11} />
        <span>{index === 0 ? "au lancement" : trig.text}</span>
      </div>
      <div className="relative overflow-hidden rounded-[14px] border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(13,33,55,0.05)] transition-all hover:border-[#B8CDD8] hover:shadow-[0_8px_22px_rgba(13,33,55,0.09)]">
        <div className="absolute inset-y-0 left-0 w-1" style={{ background: color }} />
        <div className="p-4 pl-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#8BAFC0]">
                Étape {step.stepOrder} · <span style={{ color }}>{label}</span>
              </p>
              <h5 className="mt-0.5 truncate text-[14px] font-semibold text-[#0D2137]">
                {step.name || label}
              </h5>
            </div>
            <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={() => onEdit(step)}
                className="rounded-md p-1.5 text-[#8BAFC0] hover:bg-[#E8F4F8] hover:text-[#2E8FAD]"
                title="Modifier"
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={() => onDelete(step)}
                className="rounded-md p-1.5 text-[#8BAFC0] hover:bg-[#FEE2E2] hover:text-[#DC2626]"
                title="Supprimer"
              >
                <Trash2 size={13} />
              </button>
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
        </div>
      </div>
    </div>
  );
}

/* ── Run step card (inside an expanded execution) ─────────────────────────── */

function RunStageCard({ step }: { step: CampaignStepRunResponse }) {
  const meta = runStatusMeta(step.status);
  const { Icon, label } = stepMeta(step.stepType);
  const duration = fmtDuration(step.startedAt, step.completedAt);
  const isRunning = meta.tone === "running";
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
    </div>
  );
}

function RunStepsPipeline({
  steps,
  isLoading,
}: {
  steps: CampaignStepRunResponse[];
  isLoading?: boolean;
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
            <RunStageCard step={s} />
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
  isMutating,
}: {
  run: CampaignRunSummaryResponse;
  isLast?: boolean;
  defaultOpen?: boolean;
  onPause?: (runId: string) => void;
  onResume?: (runId: string) => void;
  isMutating?: boolean;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  const detail = useCampaignRunDetail(open ? (run.id ?? null) : null);
  const meta = runStatusMeta(run.status);
  const steps = detail.detail?.steps ?? [];
  const total = steps.length;
  const completed = steps.filter((s) => runStatusMeta(s.status).tone === "success").length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  const status = (run.status || "").toLowerCase();
  const canPause = status === "running";
  const canResume = ["paused", "waitingtoken", "waiting"].includes(status);

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
              {completed}/{total} étapes
            </span>
          )}
          <div
            className="flex shrink-0 items-center gap-1.5"
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
            <RunStepsPipeline steps={steps} isLoading={detail.isLoading} />
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
  isMutating,
}: {
  runs: CampaignRunSummaryResponse[];
  onPause?: (runId: string) => void;
  onResume?: (runId: string) => void;
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
          isMutating={isMutating}
        />
      ))}
    </div>
  );
}
