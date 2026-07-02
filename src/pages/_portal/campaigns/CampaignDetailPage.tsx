import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  BarChart2,
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
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type Column } from "@/components/data-table/DataTable";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { PageLoader } from "@/components/feedback/PageLoader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { formatDateTime } from "@/lib/date";
import { fmt, statusLabel, cn } from "@/lib/utils";
import type {
  SearchMessageResponse,
  SearchCampaignStepResponse,
} from "@/shared/api/generated/types.gen";
import { DeliveryFunnel } from "@/components/charts/DeliveryRateChart";

import { useCampaignDetailViewModel } from "@/hooks/useCampaignDetailViewModel";
import { useCampaignSteps } from "@/hooks/useCampaignSteps";
import { useCampaignRuns, useCampaignRunDetail } from "@/hooks/useCampaignRuns";
import { useCampaignMessages } from "@/hooks/useCampaignMessages";
import { useCampaignStats } from "@/hooks/useCampaignStats";
import { CampaignStepModal } from "@/components/features/campaigns/CampaignStepModal";
import { STEP_TYPE_LABELS, type StepType } from "@/components/features/campaigns/stepConfig";

const tabs = [
  { id: "overview", label: "Tableau de bord", icon: BarChart2 },
  { id: "steps", label: "Étapes", icon: Layers },
  { id: "runs", label: "Exécutions", icon: PlayCircle },
  { id: "messages", label: "Journal d'envois", icon: MessageSquare },
];

const MSG_STATUS_LABEL: Record<string, string> = {
  sent: "Envoyé", delivered: "Livré", read: "Lu", opened: "Ouvert",
  failed: "Échoué", bounced: "Rejeté", queued: "En file", pending: "En attente",
  scheduled: "Planifié", sending: "En cours",
};
function msgStatusVariant(s?: string | null): "success" | "warning" | "error" | "neutral" {
  const v = (s || "").toLowerCase();
  if (["sent", "delivered", "read", "opened"].includes(v)) return "success";
  if (["failed", "bounced", "error"].includes(v)) return "error";
  if (["queued", "pending", "scheduled", "sending"].includes(v)) return "warning";
  return "neutral";
}
function runStatusVariant(s?: string | null): "success" | "warning" | "error" | "neutral" {
  const v = (s || "").toLowerCase();
  if (["completed", "succeeded", "running"].includes(v)) return "success";
  if (["failed", "error"].includes(v)) return "error";
  if (["scheduled", "paused", "waitingtoken", "pending"].includes(v)) return "warning";
  return "neutral";
}

export function CampaignDetailPage({ campaignId }: { campaignId: string }) {
  const navigate = useNavigate();
  const vm = useCampaignDetailViewModel(campaignId);
  const stats = useCampaignStats(campaignId);
  const stepsVm = useCampaignSteps(campaignId, { enabled: vm.activeTab === "steps" });
  const runsVm = useCampaignRuns(campaignId, { enabled: vm.activeTab === "runs" });
  const messagesVm = useCampaignMessages(campaignId, { enabled: vm.activeTab === "messages" });

  const [stepModalOpen, setStepModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<SearchCampaignStepResponse | null>(null);
  const [detailRunId, setDetailRunId] = useState<string | null>(null);
  const runDetail = useCampaignRunDetail(detailRunId);

  if (vm.isLoading)
    return <div className="py-20"><PageLoader /></div>;

  const c = vm.campaign;
  if (!c)
    return (
      <div className="py-20 text-center text-[13px] text-[#8BAFC0]">
        Campagne introuvable.
        <div className="mt-4">
          <Button variant="secondary" size="sm" onClick={() => navigate({ to: "/dashboard" })}>
            <ArrowLeft size={13} /> Retour
          </Button>
        </div>
      </div>
    );

  const isRecurring = c.type === "recurring" || c.isRecurring;
  const nextOrder =
    (stepsVm.campaignSteps.reduce((m, s) => Math.max(m, s.stepOrder ?? 0), 0) || 0) + 10;

  const openCreateStep = () => { setEditingStep(null); setStepModalOpen(true); };
  const openEditStep = (s: SearchCampaignStepResponse) => { setEditingStep(s); setStepModalOpen(true); };
  const saveStep = async (body: any) => {
    if (body.id) await stepsVm.handleUpdate(body);
    else await stepsVm.handleAdd(body);
  };

  const messageColumns: Column<SearchMessageResponse>[] = [
    { key: "recipientAddress", label: "Destinataire", render: (m) => <span className="text-[#0D2137]">{m.recipientAddress}</span> },
    { key: "channelCode", label: "Canal", width: "110px", render: (m) => <span className="text-[#4A7A94]">{m.channelCode}</span> },
    {
      key: "status", label: "Statut", width: "110px",
      render: (m) => (
        <Badge variant={msgStatusVariant(m.status)} dot>
          {MSG_STATUS_LABEL[(m.status || "").toLowerCase()] || m.status || "—"}
        </Badge>
      ),
    },
    { key: "sentAt", label: "Envoyé le", width: "160px", render: (m) => <span className="text-[#8BAFC0] text-[12px]">{m.sentAt ? formatDateTime(m.sentAt) : "—"}</span> },
  ];

  return (
    <div className="p-7 space-y-5">
      <button
        onClick={() => navigate({ to: "/dashboard" })}
        className="flex items-center gap-2 text-[12.5px] text-[#8BAFC0] hover:text-[#0D2137] transition-colors"
      >
        <ArrowLeft size={13} /> Campagnes
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[20px] font-semibold text-[#0D2137] tracking-tight">{c.name}</h1>
            <Badge variant={vm.statusVariant(c.status)} dot>{statusLabel(c.status)}</Badge>
            <Badge variant="neutral">{isRecurring ? "Récurrente" : "Ponctuelle"}</Badge>
          </div>
          <p className="text-[12.5px] text-[#8BAFC0] mt-1">
            {isRecurring
              ? <>cron <span className="font-mono">{c.cronExpression || "—"}</span>{c.nextRunAt ? ` · prochaine ${formatDateTime(c.nextRunAt)}` : ""}</>
              : (c.description || "Campagne ponctuelle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => navigate({ to: "/campaigns/$campaignId/edit", params: { campaignId } })}>
            <Edit size={13} /> Éditer
          </Button>
          {isRecurring && (
            <>
              <Button variant="secondary" size="sm" onClick={() => vm.handleSchedule()} loading={vm.isScheduling}>
                <CalendarClock size={13} /> Planifier
              </Button>
              <Button variant="secondary" size="sm" onClick={() => vm.handleUnschedule()} loading={vm.isScheduling}>
                <CalendarX size={13} /> Déplanifier
              </Button>
            </>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={async () => { await runsVm.startRun(); vm.setActiveTab("runs"); }}
            loading={runsVm.isMutating}
          >
            <Play size={13} /> Démarrer une exécution
          </Button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Ciblés", value: fmt(stats.totalRecipients) },
          { label: "Envoyés", value: fmt(stats.totalSent) },
          { label: "Livrés", value: fmt(stats.totalDelivered) },
          { label: "Échecs", value: fmt(stats.totalFailed + stats.totalBounced) },
          { label: "Taux livraison", value: `${stats.deliveryRate}%` },
        ].map((k) => (
          <Card key={k.label}>
            <CardBody className="py-3.5 text-center">
              <p className="text-[18px] font-semibold text-[#0D2137] tabular-nums">{k.value}</p>
              <p className="text-[10.5px] text-[#8BAFC0] uppercase tracking-[0.05em] mt-1">{k.label}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E5E7EB]">
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

      {/* Overview */}
      {vm.activeTab === "overview" && (
        <Card>
          <CardHeader title="Entonnoir de diffusion" />
          <CardBody>
            {stats.hasActivity ? (
              <DeliveryFunnel
                rows={[
                  { label: "Ciblés", count: stats.totalRecipients, pct: 100, color: "#8BAFC0" },
                  { label: "Envoyés", count: stats.totalSent, pct: stats.totalRecipients ? Math.round((stats.totalSent / stats.totalRecipients) * 100) : 0, color: "#2E8FAD" },
                  { label: "Livrés", count: stats.totalDelivered, pct: stats.totalSent ? Math.round((stats.totalDelivered / stats.totalSent) * 100) : 0, color: "#16A34A" },
                  { label: "Ouverts", count: stats.totalOpened, pct: stats.totalDelivered ? Math.round((stats.totalOpened / stats.totalDelivered) * 100) : 0, color: "#6AB8D4" },
                ]}
              />
            ) : (
              <p className="text-[13px] text-[#8BAFC0] text-center py-8">
                Aucune activité de diffusion pour l'instant.
              </p>
            )}
          </CardBody>
        </Card>
      )}

      {/* Steps */}
      {vm.activeTab === "steps" && (
        <Card>
          <CardHeader
            title="Étapes du workflow"
            action={<span onClick={openCreateStep} className="flex items-center gap-1"><Plus size={12} /> Ajouter une étape</span>}
          />
          <CardBody className="space-y-2">
            {stepsVm.isLoading && <p className="text-[13px] text-[#8BAFC0]">Chargement…</p>}
            {!stepsVm.isLoading && stepsVm.campaignSteps.length === 0 && (
              <p className="text-[13px] text-[#8BAFC0] text-center py-4">Aucune étape configurée.</p>
            )}
            {stepsVm.campaignSteps.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 border border-[#E5E7EB] bg-white rounded-md">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F3F4F6] text-[12px] font-semibold text-[#4A7A94]">
                    {s.stepOrder}
                  </span>
                  <div>
                    <h5 className="text-[13px] font-semibold text-[#0D2137]">{s.name || "Sans nom"}</h5>
                    <p className="text-[11px] text-[#8BAFC0] mt-0.5">
                      {STEP_TYPE_LABELS[(s.stepType as StepType)] ?? s.stepType} · {s.startMode}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openEditStep(s)}><Edit size={14} /></Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (s.id && confirm("Supprimer cette étape ?")) stepsVm.handleDelete(s.id);
                    }}
                  >
                    <Trash2 size={14} className="text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      {/* Runs */}
      {vm.activeTab === "runs" && (
        <Card>
          <CardHeader
            title="Exécutions"
            action={<span onClick={() => runsVm.refetch()}>Rafraîchir</span>}
          />
          <CardBody className="space-y-2">
            {runsVm.isLoading && <p className="text-[13px] text-[#8BAFC0]">Chargement…</p>}
            {!runsVm.isLoading && runsVm.runs.length === 0 && (
              <p className="text-[13px] text-[#8BAFC0] text-center py-4">Aucune exécution.</p>
            )}
            {runsVm.runs.map((r) => (
              <div key={r.id}>
                <div className="flex items-center justify-between p-3 border border-[#E5E7EB] bg-white rounded-md">
                  <div className="flex items-center gap-3">
                    <Badge variant={runStatusVariant(r.status)} dot>{r.status || "—"}</Badge>
                    <div>
                      <p className="text-[12.5px] font-medium text-[#0D2137]">
                        {(r.id ?? "").slice(0, 8)} · {r.trigger || "manuel"}
                      </p>
                      <p className="text-[11px] text-[#8BAFC0]">
                        {r.startedAt ? formatDateTime(r.startedAt) : "—"}
                        {r.completedAt ? ` → ${formatDateTime(r.completedAt)}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {(r.status || "").toLowerCase() === "running" && (
                      <Button variant="ghost" size="sm" onClick={() => r.id && runsVm.pauseRun(r.id)} title="Mettre en pause"><Pause size={14} /></Button>
                    )}
                    {["paused", "waitingtoken"].includes((r.status || "").toLowerCase()) && (
                      <Button variant="ghost" size="sm" onClick={() => r.id && runsVm.resumeRun(r.id)} title="Reprendre"><RotateCcw size={14} /></Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => setDetailRunId(detailRunId === r.id ? null : r.id ?? null)}>Détail</Button>
                  </div>
                </div>
                {detailRunId === r.id && (
                  <div className="mt-1 ml-4 border-l-2 border-[#E5E7EB] pl-3 space-y-1.5 py-2">
                    {runDetail.isLoading && <p className="text-[12px] text-[#8BAFC0]">Chargement du détail…</p>}
                    {(runDetail.detail?.steps ?? []).map((st) => (
                      <div key={st.id} className="flex items-center gap-2 text-[12px]">
                        <span className="text-[#8BAFC0]">#{st.stepOrder}</span>
                        <span className="text-[#0D2137]">{STEP_TYPE_LABELS[(st.stepType as StepType)] ?? st.stepType}</span>
                        <Badge variant={runStatusVariant(st.status)} dot>{st.status || "—"}</Badge>
                        {st.error && <span className="text-[#DC2626]">{st.error}</span>}
                      </div>
                    ))}
                    {!runDetail.isLoading && (runDetail.detail?.steps ?? []).length === 0 && (
                      <p className="text-[12px] text-[#8BAFC0]">Aucun détail d'étape.</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      {/* Messages */}
      {vm.activeTab === "messages" && (
        <Card>
          <CardHeader title="Journal d'envois" />
          <CardBody>
            {messagesVm.messages.length === 0 && !messagesVm.isLoading ? (
              <EmptyState icon={<MessageSquare size={32} />} title="Aucun message" description="Les envois apparaîtront ici une fois la campagne exécutée." />
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
          </CardBody>
        </Card>
      )}

      <CampaignStepModal
        open={stepModalOpen}
        onClose={() => setStepModalOpen(false)}
        productId={c.productId}
        editing={editingStep}
        nextOrder={nextOrder}
        onSave={saveStep}
        isSaving={stepsVm.isActionPending}
      />
    </div>
  );
}
