import { useState } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import {
  ArrowLeft,
  Layers,
  PlayCircle,
  MessageSquare,
  Edit,
  Plus,
  Play,
  Pause,
  RotateCcw,
  CalendarClock,
  CalendarX,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type Column } from "@/components/data-table/DataTable";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { PageLoader } from "@/components/feedback/PageLoader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { formatDateTime, formatRelative } from "@/lib/date";
import { statusLabel, cn } from "@/lib/utils";
import { describeCron } from "@/lib/cron";
import type {
  SearchMessageResponse,
  SearchCampaignStepResponse,
} from "@/shared/api/generated/types.gen";
import { FunnelChart } from "@/components/charts/FunnelChart";

import { useCampaignDetailViewModel } from "@/hooks/useCampaignDetailViewModel";
import { useCampaignSteps } from "@/hooks/useCampaignSteps";
import { useCampaignRuns } from "@/hooks/useCampaignRuns";
import { useCampaignMessages } from "@/hooks/useCampaignMessages";
import { useCampaignStats } from "@/hooks/useCampaignStats";
import { CampaignStepModal } from "@/components/features/campaigns/CampaignStepModal";
import { CampaignFormModal } from "@/components/features/campaigns/CampaignFormModal";
import {
  CampaignStepGraph,
  CampaignRunsTimeline,
} from "@/components/features/campaigns/CampaignPipeline";

// No "Tableau de bord" tab: its funnel restated the header's KPI strip, so the
// funnel *is* the header summary now and the tabs are the working views only.
const tabs = [
  { id: "runs", label: "Exécutions", icon: PlayCircle },
  { id: "steps", label: "Étapes", icon: Layers },
  { id: "messages", label: "Journal d'envois", icon: MessageSquare },
];

const MSG_STATUS_LABEL: Record<string, string> = {
  sent: "Envoyé",
  delivered: "Livré",
  read: "Lu",
  opened: "Ouvert",
  failed: "Échoué",
  bounced: "Rejeté",
  queued: "En file",
  pending: "En attente",
  scheduled: "Planifié",
  sending: "En cours",
};
function msgStatusVariant(
  s?: string | null,
): "success" | "warning" | "error" | "neutral" {
  const v = (s || "").toLowerCase();
  if (["sent", "delivered", "read", "opened"].includes(v)) return "success";
  if (["failed", "bounced", "error"].includes(v)) return "error";
  if (["queued", "pending", "scheduled", "sending"].includes(v))
    return "warning";
  return "neutral";
}
/** Funnel-stage caption: a stage's share of the targeted total (matches the
 * count-proportional bar heights, so nothing contradicts the KPI strip). */
function pctOf(part: number, whole: number): string {
  const p = whole > 0 ? Math.round((part / whole) * 100) : 0;
  return `${p}% des ciblés`;
}
export function CampaignDetailPage({ campaignId }: { campaignId: string }) {
  const navigate = useNavigate();
  const router = useRouter();
  const vm = useCampaignDetailViewModel(campaignId);
  const stats = useCampaignStats(campaignId);
  const stepsVm = useCampaignSteps(campaignId, {
    enabled: vm.activeTab === "steps",
  });
  // Runs are loaded regardless of the active tab so the hero can surface the
  // active execution's controls (pause / resume).
  const runsVm = useCampaignRuns(campaignId);
  const messagesVm = useCampaignMessages(campaignId, {
    enabled: vm.activeTab === "messages",
  });

  const [stepModalOpen, setStepModalOpen] = useState(false);
  const [editingStep, setEditingStep] =
    useState<SearchCampaignStepResponse | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  if (vm.isLoading)
    return (
      <div className="py-20">
        <PageLoader />
      </div>
    );

  const c = vm.campaign;
  if (!c)
    return (
      <div className="py-20 text-center text-[13px] text-[#8BAFC0]">
        Campagne introuvable.
        <div className="mt-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.history.back()}
          >
            <ArrowLeft size={13} /> Retour
          </Button>
        </div>
      </div>
    );

  const isRecurring = c.type === "recurring" || c.isRecurring;
  const isScheduled = (c.status || "").toLowerCase() === "scheduled";

  // Active execution (if any) drives the hero's pause / resume control.
  const activeRun = runsVm.runs.find((r) =>
    ["running", "paused", "waitingtoken", "waiting"].includes(
      (r.status || "").toLowerCase(),
    ),
  );
  const activeStatus = (activeRun?.status || "").toLowerCase();
  const canPauseRun = activeStatus === "running";
  const canResumeRun = ["paused", "waitingtoken", "waiting"].includes(
    activeStatus,
  );

  const goRunsTab = () => vm.setActiveTab("runs");

  const nextOrder =
    (stepsVm.campaignSteps.reduce((m, s) => Math.max(m, s.stepOrder ?? 0), 0) ||
      0) + 10;

  const openCreateStep = () => {
    setEditingStep(null);
    setStepModalOpen(true);
  };
  const openEditStep = (s: SearchCampaignStepResponse) => {
    setEditingStep(s);
    setStepModalOpen(true);
  };
  const saveStep = async (body: any) => {
    if (body.id) await stepsVm.handleUpdate(body);
    else await stepsVm.handleAdd(body);
  };

  const messageColumns: Column<SearchMessageResponse>[] = [
    {
      key: "recipientAddress",
      label: "Destinataire",
      render: (m) => (
        <span className="text-[#0D2137]">{m.recipientAddress}</span>
      ),
    },
    {
      key: "channelCode",
      label: "Canal",
      width: "110px",
      render: (m) => <span className="text-[#4A7A94]">{m.channelCode}</span>,
    },
    {
      key: "status",
      label: "Statut",
      width: "110px",
      render: (m) => (
        <Badge variant={msgStatusVariant(m.status)} dot>
          {MSG_STATUS_LABEL[(m.status || "").toLowerCase()] || m.status || "—"}
        </Badge>
      ),
    },
    {
      key: "sentAt",
      label: "Envoyé le",
      width: "160px",
      render: (m) => (
        <span className="text-[#8BAFC0] text-[12px]">
          {m.sentAt ? formatDateTime(m.sentAt) : "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-7 space-y-5">
      <button
        onClick={() =>
          navigate({
            to: "/$productId/campaigns",
            params: { productId: c.productId },
          })
        }
        className="flex items-center gap-2 text-[12.5px] text-[#8BAFC0] hover:text-[#0D2137] transition-colors"
      >
        <ArrowLeft size={13} /> Campagnes
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-[20px] font-semibold text-[#0D2137] tracking-tight">
              {c.name}
            </h1>
            <Badge variant={vm.statusVariant(c.status)} dot>
              {statusLabel(c.status)}
            </Badge>
            <Badge variant="neutral">
              {isRecurring ? "Récurrente" : "Ponctuelle"}
            </Badge>
            {activeRun && (
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10.5px] font-medium",
                  canPauseRun
                    ? "bg-[#E8F4F8] text-[#2E8FAD]"
                    : "bg-[#FEF3C7] text-[#B45309]",
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    canPauseRun ? "bg-[#2E8FAD] animate-pulse" : "bg-[#D97706]",
                  )}
                />
                {canPauseRun ? "Exécution en cours" : "Exécution en pause"}
              </span>
            )}
          </div>
          <p className="text-[12.5px] text-[#8BAFC0] mt-1">
            {isRecurring ? (
              <>
                {describeCron(c.cronExpression)}
                {c.nextRunAt
                  ? ` · prochaine ${formatDateTime(c.nextRunAt)}`
                  : ""}
              </>
            ) : (
              c.description || "Campagne ponctuelle"
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <Button variant="ghost" size="sm" onClick={() => setEditOpen(true)}>
            <Edit size={13} /> Éditer
          </Button>

          {/* Scheduling — recurring only, single contextual toggle */}
          {isRecurring &&
            (isScheduled ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => vm.handleUnschedule()}
                loading={vm.isScheduling}
              >
                <CalendarX size={13} /> Déplanifier
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => vm.handleSchedule()}
                loading={vm.isScheduling}
              >
                <CalendarClock size={13} /> Planifier
              </Button>
            ))}

          {/* Run control — contextual to the active execution */}
          {canPauseRun ? (
            <Button
              variant="primary"
              size="sm"
              loading={runsVm.isMutating}
              onClick={async () => {
                if (activeRun?.id) await runsVm.pauseRun(activeRun.id);
                goRunsTab();
              }}
            >
              <Pause size={13} /> Mettre en pause
            </Button>
          ) : canResumeRun ? (
            <Button
              variant="primary"
              size="sm"
              loading={runsVm.isMutating}
              onClick={async () => {
                if (activeRun?.id) await runsVm.resumeRun(activeRun.id);
                goRunsTab();
              }}
            >
              <RotateCcw size={13} /> Reprendre
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              loading={runsVm.isMutating}
              onClick={async () => {
                await runsVm.startRun();
                goRunsTab();
              }}
            >
              <Play size={13} /> Démarrer une exécution
            </Button>
          )}
        </div>
      </div>

      {/* Diffusion summary — the former "Tableau de bord" tab, now the header's
          own KPI block. Hidden entirely while there is nothing to show, so a
          fresh campaign doesn't push the tabs down behind an empty chart. */}
      {stats.hasActivity && (
        <Card>
          <CardHeader title="Entonnoir de diffusion" />
          <CardBody>
            <FunnelChart
              stages={[
                {
                  label: "Ciblés",
                  count: stats.totalRecipients,
                  hint: "Point de départ",
                },
                {
                  label: "Envoyés",
                  count: stats.totalSent,
                  hint: pctOf(stats.totalSent, stats.totalRecipients),
                },
                {
                  label: "Livrés",
                  count: stats.totalDelivered,
                  hint: pctOf(stats.totalDelivered, stats.totalRecipients),
                },
                {
                  label: "Ouverts",
                  count: stats.totalOpened,
                  hint: pctOf(stats.totalOpened, stats.totalRecipients),
                },
              ]}
              conversion={{
                value: stats.deliveryRate,
                label: "Taux de livraison",
              }}
              // Failures leave the funnel instead of narrowing it — shown as a
              // red arrow peeling off after "Envoyés", where the loss occurs.
              leak={{
                count: stats.totalFailed + stats.totalBounced,
                label: "échecs",
                afterIndex: 1,
              }}
            />
          </CardBody>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[#E5E7EB] overflow-x-auto [&::-webkit-scrollbar]:hidden">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => vm.setActiveTab(t.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-[13px] border-b-2 transition-all whitespace-nowrap",
              vm.activeTab === t.id
                ? "text-[#1B5E82] font-medium border-[#2E8FAD]"
                : "text-[#4A7A94] border-transparent hover:text-[#0D2137]",
            )}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* Steps — workflow pipeline */}
      {vm.activeTab === "steps" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[14px] font-semibold text-[#0D2137]">
                Workflow de la campagne
              </h3>
              <p className="text-[12px] text-[#8BAFC0]">
                Enchaînement des étapes exécutées à chaque lancement.
              </p>
            </div>
            <Button variant="primary" size="sm" onClick={openCreateStep}>
              <Plus size={13} /> Ajouter une étape
            </Button>
          </div>
          <CampaignStepGraph
            steps={stepsVm.campaignSteps}
            productId={c.productId}
            isLoading={stepsVm.isLoading}
            onEdit={openEditStep}
            onDelete={(s) => {
              if (s.id && confirm("Supprimer cette étape ?"))
                stepsVm.handleDelete(s.id);
            }}
            onAdd={openCreateStep}
            onReorder={stepsVm.handleReorder}
          />
        </div>
      )}

      {/* Runs — execution pipelines */}
      {vm.activeTab === "runs" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[14px] font-semibold text-[#0D2137]">
                Exécutions
              </h3>
              <p className="text-[12px] text-[#8BAFC0]">
                Suivi visuel du déroulé de chaque lancement.
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => runsVm.refetch()}>
              <RefreshCw size={13} /> Rafraîchir
            </Button>
          </div>

          {runsVm.isLoading ? (
            <div className="py-10">
              <PageLoader />
            </div>
          ) : runsVm.runs.length === 0 ? (
            <EmptyState
              icon={<PlayCircle size={32} />}
              title="Aucune exécution"
              description="Démarrez une exécution pour suivre le déroulé des étapes."
            />
          ) : (
            <CampaignRunsTimeline
              runs={runsVm.runs}
              onPause={(id) => runsVm.pauseRun(id)}
              onResume={(id) => runsVm.resumeRun(id)}
              onCancel={(id) => {
                if (confirm("Annuler cette exécution ?")) runsVm.cancelRun(id);
              }}
              onResendFailed={(id) => runsVm.resendFailed(id)}
              isMutating={runsVm.isMutating}
            />
          )}
        </div>
      )}

      {/* Messages */}
      {vm.activeTab === "messages" && (
        <>
          {messagesVm.messages.length === 0 && !messagesVm.isLoading ? (
            <EmptyState
              icon={<MessageSquare size={32} />}
              title="Aucun message"
              description="Les envois apparaîtront ici une fois la campagne exécutée."
            />
          ) : (
            <DataTable
              columns={messageColumns}
              data={messagesVm.messages}
              loading={messagesVm.isLoading}
              getRowId={(m) => m.id ?? ""}
              pagination={{
                total: messagesVm.totalCount,
                pageSize: 50,
                page: messagesVm.page,
                onPageChange: messagesVm.setPage,
              }}
            />
          )}
        </>
      )}

      <CampaignStepModal
        open={stepModalOpen}
        onClose={() => setStepModalOpen(false)}
        productId={c.productId}
        editing={editingStep}
        nextOrder={nextOrder}
        steps={stepsVm.campaignSteps}
        onSave={saveStep}
        isSaving={stepsVm.isActionPending}
      />

      <CampaignFormModal
        open={editOpen}
        campaignId={campaignId}
        onClose={() => {
          setEditOpen(false);
          vm.refetch();
        }}
      />
    </div>
  );
}
