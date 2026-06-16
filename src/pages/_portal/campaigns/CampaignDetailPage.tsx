import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  BarChart2,
  Users,
  MessageSquare,
  Radio,
  Layers,
  Edit,
  Trash2,
  Settings2,
  Plus,
  Send,
  Calendar,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type Column } from "@/components/data-table/DataTable";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { PageLoader } from "@/components/feedback/PageLoader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { PrioritySelector } from "@/components/ui/PrioritySelector";
import { SegmentManagerModal } from "@/components/features/contacts/SegmentManagerModal";
import { formatDate } from "@/lib/date";
import { formatCurrency } from "@/lib/currency";
import { fmt, statusLabel, cn } from "@/lib/utils";
import { fadeInUp } from "@/lib/animations";
import type { SearchMessageResponse } from "@/shared/api/generated/types.gen";
import { DeliveryFunnel } from "@/components/charts/DeliveryRateChart";

// ViewModels
import { useCampaignDetailViewModel } from "@/hooks/useCampaignDetailViewModel";
import { useCampaignChannels } from "@/hooks/useCampaignChannels";
import { useCampaignSegments } from "@/hooks/useCampaignSegments";
import { useCampaignSteps } from "@/hooks/useCampaignSteps";
import { useCampaignMessages } from "@/hooks/useCampaignMessages";
import { useCampaignStats } from "@/hooks/useCampaignStats";

const tabs = [
  { id: "overview", label: "Tableau de bord", icon: BarChart2 },
  { id: "channels", label: "Canaux & Templates", icon: Radio },
  { id: "segments", label: "Ciblage Audience", icon: Users },
  { id: "steps", label: "Séquence Automatique", icon: Layers },
  { id: "messages", label: "Journal d'Envois", icon: MessageSquare },
];

// Message statuses → French label + Badge variant (statusLabel doesn't cover
// the message-specific values like sent/queued/bounced).
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
  if (["queued", "pending", "scheduled", "sending"].includes(v)) return "warning";
  return "neutral";
}

export function CampaignDetailPage({campaignId}:{campaignId: string}) {
  const navigate = useNavigate();

  // Master ViewModel
  const vm = useCampaignDetailViewModel(campaignId);

  // Tab-specific ViewModels
  // channelsVm & statsVm are eager — their data feeds the overview KPI strip
  const channelsVm = useCampaignChannels(campaignId, vm.campaign?.productId);
  const statsVm = useCampaignStats(campaignId);
  // The three remaining tabs are lazy: queries only fire when the tab is active
  const segmentsVm = useCampaignSegments(
    campaignId,
    vm.campaign?.productId,
    { enabled: vm.activeTab === "segments" },
  );
  const stepsVm = useCampaignSteps(campaignId, {
    enabled: vm.activeTab === "steps",
  });
  const messagesVm = useCampaignMessages(campaignId, {
    enabled: vm.activeTab === "messages",
  });

  // Local UI state for modals
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isSegmentAddOpen, setIsSegmentAddOpen] = useState(false);
  const [isSegmentManagerOpen, setIsSegmentManagerOpen] = useState(false);
  const [isStepAddOpen, setIsStepAddOpen] = useState(false);

  const [newConfig, setNewConfig] = useState({
    channelId: "",
    templateId: "",
    priority: 1,
  });
  const [selectedSegmentId, setSelectedSegmentId] = useState("");
  // Only fields from CreateCampaignStepRequest: { campaignId, templateId, channelId, stepOrder, name, delayInMinutes, conditions }
  const [newStep, setNewStep] = useState({
    name: "",
    channelId: "",
    templateId: "",
    delayInMinutes: 0,
    conditions: "",
  });

  if (vm.isLoading)
    return (
      <div className="py-20">
        <PageLoader />
      </div>
    );
  if (!vm.campaign)
    return (
      <div className="p-16 text-center">
        <div className="w-14 h-14 bg-white border border-[#E5E7EB] rounded-[14px] flex items-center justify-center mx-auto mb-5">
          <AlertCircle size={26} className="text-[#8BAFC0] opacity-50" />
        </div>
        <h2 className="text-[16px] font-semibold text-[#0D2137]">
          Campagne introuvable
        </h2>
        <Button
          variant="secondary"
          className="mt-4"
          onClick={() => navigate({ to: "/dashboard" })}
        >
          Retour à la liste
        </Button>
      </div>
    );

  const failed = vm.campaign.failedSends || 0;
  const kpis = [
    {
      label: "Ciblés",
      value: fmt(vm.campaign.totalRecipients || 0),
      icon: Users,
      danger: false,
    },
    {
      label: "Délivrés",
      value: fmt(vm.campaign.successfulSends || 0),
      icon: CheckCircle2,
      danger: false,
    },
    { label: "Échecs", value: fmt(failed), icon: AlertCircle, danger: failed > 0 },
    {
      label: "Canaux",
      value: channelsVm.campaignChannels.length,
      icon: Radio,
      danger: false,
    },
    {
      label: "Coût",
      value: formatCurrency(statsVm.totalCost),
      icon: Calendar,
      danger: false,
    },
  ];

  // Honest delivery funnel from the real statistic response — no time-series
  // endpoint exists, so we visualise the aggregates we actually have.
  const base = Math.max(statsVm.totalRecipients, statsVm.totalSent, 1);
  const pctOf = (n: number) => Math.round((n / base) * 100);
  const funnelRows = [
    { label: "Destinataires", count: statsVm.totalRecipients, pct: pctOf(statsVm.totalRecipients), color: "#8BAFC0" },
    { label: "Envoyés", count: statsVm.totalSent, pct: pctOf(statsVm.totalSent), color: "#2E8FAD" },
    { label: "Délivrés", count: statsVm.totalDelivered, pct: pctOf(statsVm.totalDelivered), color: "#1B5E82" },
    { label: "Ouverts", count: statsVm.totalOpened, pct: pctOf(statsVm.totalOpened), color: "#2E8FAD" },
    { label: "Cliqués", count: statsVm.totalClicked, pct: pctOf(statsVm.totalClicked), color: "#6AB8D4" },
    { label: "Échecs", count: statsVm.totalFailed, pct: pctOf(statsVm.totalFailed), color: "#DC2626" },
    { label: "Rebonds", count: statsVm.totalBounced, pct: pctOf(statsVm.totalBounced), color: "#D97706" },
  ];

  const rateRows = [
    { l: "Délivrabilité", v: statsVm.deliveryRate, danger: false },
    { l: "Ouverture", v: statsVm.openRate, danger: false },
    { l: "Clic", v: statsVm.clickRate, danger: false },
    { l: "Rebond", v: statsVm.bounceRate, danger: true },
  ];

  const paramRows = [
    { k: "Type", v: statusLabel(vm.campaign.type || "standard"), icon: Layers },
    {
      k: "Planification",
      v: vm.campaign.scheduledAt
        ? formatDate(vm.campaign.scheduledAt)
        : "Diffusion immédiate",
      icon: Clock,
    },
    ...(vm.campaign.startedAt
      ? [{ k: "Démarrée le", v: formatDate(vm.campaign.startedAt), icon: Send }]
      : []),
    ...(vm.campaign.completedAt
      ? [{ k: "Terminée le", v: formatDate(vm.campaign.completedAt), icon: CheckCircle2 }]
      : []),
    ...(vm.campaign.recurrencePattern
      ? [{ k: "Récurrence", v: vm.campaign.recurrencePattern, icon: Radio }]
      : []),
    ...(vm.campaign.productName
      ? [{ k: "Produit", v: vm.campaign.productName, icon: Layers }]
      : []),
    {
      k: "Créée le",
      v: vm.campaign.createdAt ? formatDate(vm.campaign.createdAt) : "—",
      icon: Calendar,
    },
  ];

  const msgColumns: Column<SearchMessageResponse>[] = [
    {
      key: "recipientAddress",
      label: "Destinataire",
      render: (m) => (
        <span className="font-medium text-[#0D2137]">{m.recipientAddress}</span>
      ),
    },
    {
      key: "channelCode",
      label: "Canal",
      render: (m) => (
        <Badge variant="neutral" className="uppercase font-medium text-[10px]">
          {m.channelCode}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Statut",
      render: (m) => {
        const v = (m.status || "").toLowerCase();
        return (
          <Badge variant={msgStatusVariant(m.status)} dot>
            {MSG_STATUS_LABEL[v] ?? statusLabel(v)}
          </Badge>
        );
      },
    },
    {
      key: "sentAt",
      label: "Date",
      render: (m) => (
        <span className="text-[12px] text-[#8BAFC0]">
          {m.sentAt ? formatDate(m.sentAt) : "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="p-7 max-w-[1500px] mx-auto">
      <button
        onClick={() => navigate({ to: "/dashboard" })}
        className="flex items-center gap-2 text-[12.5px] text-[#8BAFC0] hover:text-[#0D2137] mb-6 transition-colors cursor-pointer group"
      >
        <ArrowLeft
          size={13}
          className="group-hover:-translate-x-0.5 transition-transform"
        />
        Campagnes
      </button>

      <motion.div {...fadeInUp} className="space-y-6">
        {/* Main Info Card */}
        <div className="bg-white border border-[#E5E7EB] rounded-[14px] overflow-hidden">
          <div className="p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-[12px] bg-[#E8F4F8] flex items-center justify-center shrink-0">
                  <Send size={22} className="text-[#2E8FAD]" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-[20px] font-semibold text-[#0D2137] tracking-tight leading-tight">
                      {vm.campaign.name}
                    </h1>
                    <Badge
                      variant={vm.statusVariant(vm.campaign.status) as any}
                      dot
                      className="px-2 py-0.5 shadow-none"
                    >
                      {statusLabel(vm.campaign.status)}
                    </Badge>
                  </div>
                  <p className="text-[12.5px] text-[#8BAFC0] font-medium leading-relaxed max-w-2xl">
                    {(vm.campaign.type || "standard").toUpperCase()} · ID:{" "}
                    {vm.campaign.id?.slice(0, 8) || "..."} · Créée le{" "}
                    {vm.campaign.createdAt
                      ? formatDate(vm.campaign.createdAt)
                      : "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                {vm.campaign.status === "draft" && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="px-6"
                    onClick={() => vm.handleLaunch()}
                    loading={vm.isStatusPending}
                  >
                    Lancer
                  </Button>
                )}
                {vm.campaign.status === "active" && (
                  <Button
                    variant="danger"
                    size="sm"
                    className="px-6"
                    onClick={() => vm.handleUpdateStatus("paused")}
                    loading={vm.isStatusPending}
                  >
                    Pause
                  </Button>
                )}
                {vm.campaign.status === "paused" && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="px-6"
                    onClick={() => vm.handleUpdateStatus("active")}
                    loading={vm.isStatusPending}
                  >
                    Reprendre
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  className="px-4 border-[#E5E7EB]"
                  onClick={() =>
                    navigate({
                      to: "/campaigns/$campaignId/edit",
                      params: { campaignId },
                    })
                  }
                >
                  <Edit size={14} className="mr-1.5" /> Modifier
                </Button>
              </div>
            </div>

            <p className="text-[13px] text-[#4A7A94] mb-8 leading-relaxed max-w-6xl px-1">
              {vm.campaign.description || "Aucune description fournie."}
            </p>

            {/* KPI STRIP - Refactored to Flat 2.0 */}
            <div className="grid grid-cols-2 lg:grid-cols-5 border-t border-[#F3F4F6] -mx-6 lg:-mx-8 pt-4 pb-1">
              {kpis.map((k, i) => (
                <div
                  key={i}
                  className={cn(
                    "px-6 lg:px-8 py-3 flex flex-col gap-1",
                    i > 0 && "lg:border-l border-[#F3F4F6]",
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <k.icon
                      size={12}
                      className={cn("text-[#8BAFC0]", k.danger && "text-[#DC2626]")}
                    />
                    <span className="text-[10.5px] text-[#8BAFC0] uppercase font-medium tracking-[0.05em]">
                      {k.label}
                    </span>
                  </div>
                  <p
                    className={cn(
                      "text-[19px] font-semibold text-[#0D2137]",
                      k.danger && "text-[#DC2626]",
                    )}
                  >
                    {k.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Navigation - Refactored to Flat 2.0 style */}
        <div className="flex bg-white border border-[#E5E7EB] rounded-[14px] overflow-hidden self-start max-w-full">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => vm.setActiveTab(t.id)}
              className={cn(
                "flex items-center gap-2.5 px-5 py-3 text-[13px] border-b-2 transition-all cursor-pointer whitespace-nowrap",
                vm.activeTab === t.id
                  ? "text-[#1B5E82] font-medium border-[#2E8FAD] bg-[#E8F4F8]"
                  : "text-[#4A7A94] border-transparent hover:text-[#0D2137] hover:bg-[#F7F8F9]",
              )}
            >
              <t.icon size={13} strokeWidth={1.5} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={vm.activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {vm.activeTab === "overview" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <div className="lg:col-span-2 space-y-5">
                    <Card>
                      <CardHeader title="Performance de diffusion" />
                      <CardBody>
                        {statsVm.hasActivity ? (
                          <>
                            <div className="grid grid-cols-4 gap-4 mb-6">
                              {rateRows.map((s) => (
                                <div key={s.l} className="space-y-0.5">
                                  <p className="text-[10.5px] text-[#8BAFC0] font-medium uppercase tracking-[0.05em]">
                                    {s.l}
                                  </p>
                                  <p
                                    className={cn(
                                      "text-[20px] font-semibold text-[#0D2137]",
                                      s.danger && s.v > 0 && "text-[#DC2626]",
                                    )}
                                  >
                                    {s.v.toFixed(1)}%
                                  </p>
                                </div>
                              ))}
                            </div>
                            <DeliveryFunnel rows={funnelRows} />
                          </>
                        ) : (
                          <EmptyState
                            title="Aucune donnée de diffusion"
                            description="Les statistiques apparaîtront dès le premier envoi de cette campagne."
                            icon={<BarChart2 size={28} />}
                          />
                        )}
                      </CardBody>
                    </Card>
                  </div>
                  <div className="space-y-5">
                    <Card>
                      <CardHeader title="Paramètres d'envoi" />
                      <CardBody className="p-0">
                        {paramRows.map((row, i) => (
                          <div
                            key={i}
                            className="flex flex-col gap-1 px-5 py-3 border-b border-[#E5E7EB] last:border-b-0"
                          >
                            <span className="text-[10.5px] text-[#8BAFC0] font-medium uppercase tracking-[0.05em]">
                              {row.k}
                            </span>
                            <span className="text-[13px] font-medium text-[#0D2137] flex items-center gap-2">
                              <row.icon size={12} className="text-[#8BAFC0]" />
                              {row.v}
                            </span>
                          </div>
                        ))}
                      </CardBody>
                    </Card>
                  </div>
                </div>
              )}

              {vm.activeTab === "channels" && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between pb-1">
                    <div>
                      <h3 className="text-[16px] font-semibold text-[#0D2137]">
                        Canaux de Diffusion
                      </h3>
                      <p className="text-[12.5px] text-[#8BAFC0]">
                        Gérez les passerelles et templates pour cette campagne
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => setIsConfigOpen(true)}
                    >
                      <Plus size={13} /> Ajouter un canal
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {channelsVm.campaignChannels.map((cc: any) => (
                      <div
                        key={cc.id}
                        className="bg-white border border-[#E5E7EB] rounded-[14px] p-4 hover:border-[#2E8FAD]/40 transition-all group relative"
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-10 h-10 rounded-[7px] bg-[#E8F4F8] flex items-center justify-center shrink-0">
                            <Radio size={16} className="text-[#2E8FAD]" />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-[13px] font-semibold text-[#0D2137] truncate">
                              {cc.channelName || cc.channelId}
                            </p>
                            <span className="text-[10.5px] text-[#8BAFC0] font-medium uppercase tracking-[0.05em]">
                              {cc.channelCode ? `${cc.channelCode} · ` : ""}Priorité{" "}
                              {cc.priority || 1}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2 pt-3 border-t border-[#E5E7EB]">
                          <div className="flex items-center justify-between text-[12px]">
                            <span className="text-[#8BAFC0]">Template</span>
                            <span className="font-medium text-[#2E8FAD] truncate max-w-[60%] text-right">
                              {cc.templateName ?? "Aucun"}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => channelsVm.handleRemove(cc.id)}
                          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg text-[#8BAFC0] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {vm.activeTab === "segments" && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between pb-1">
                    <div>
                      <h3 className="text-[16px] font-semibold text-[#0D2137]">
                        Segments ciblés
                      </h3>
                      <p className="text-[12.5px] text-[#8BAFC0]">
                        Définissez l'audience de cette campagne
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="gap-1.5 bg-white border-[#E5E7EB]"
                        onClick={() => setIsSegmentManagerOpen(true)}
                      >
                        <Settings2 size={13} /> Gérer
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => setIsSegmentAddOpen(true)}
                      >
                        <Plus size={13} /> Cibler
                      </Button>
                    </div>
                  </div>
                  {segmentsVm.campaignSegments.length === 0 ? (
                    <EmptyState
                      title="Aucune audience ciblée"
                      description="Ajoutez des segments pour définir les destinataires de cette campagne."
                      icon={<Users size={32} />}
                      action={
                        <Button
                          variant="primary"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => setIsSegmentAddOpen(true)}
                        >
                          <Plus size={13} /> Cibler un segment
                        </Button>
                      }
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {segmentsVm.campaignSegments.map((cs: any) => (
                        <div
                          key={cs.id}
                          className="bg-white border border-[#E5E7EB] rounded-[14px] p-4 flex items-center justify-between group hover:border-[#2E8FAD]/30 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-[9px] bg-[#F3F4F6] flex items-center justify-center text-[#4A7A94] group-hover:bg-[#E8F4F8] group-hover:text-[#2E8FAD] transition-all shrink-0">
                              <Users size={16} />
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-[13px] font-semibold text-[#0D2137] truncate">
                                {cs.segmentName || cs.segmentId}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => segmentsVm.handleRemove(cs.id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#8BAFC0] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {vm.activeTab === "steps" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-1">
                    <div>
                      <h3 className="text-[16px] font-semibold text-[#0D2137]">
                        Séquence Automatique
                      </h3>
                      <p className="text-[12.5px] text-[#8BAFC0]">
                        Définissez les étapes de diffusion programmée
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => setIsStepAddOpen(true)}
                    >
                      <Plus size={13} /> Ajouter une étape
                    </Button>
                  </div>

                  {stepsVm.campaignSteps.length === 0 ? (
                    <EmptyState
                      title="Aucune étape définie"
                      description="Créez une séquence d'envois automatiques pour cette campagne."
                      icon={<Layers size={32} />}
                      action={
                        <Button
                          variant="primary"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => setIsStepAddOpen(true)}
                        >
                          <Plus size={13} /> Créer la première étape
                        </Button>
                      }
                    />
                  ) : (
                    <div className="space-y-4">
                      {stepsVm.campaignSteps.map((step: any, idx: number) => (
                        <div
                          key={step.id}
                          className="relative flex gap-6 group"
                        >
                          {/* Timeline connector */}
                          {idx < stepsVm.campaignSteps.length - 1 && (
                            <div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-[#E5E7EB]" />
                          )}

                          <div className="shrink-0 w-10 h-10 rounded-full bg-[#E8F4F8] border-2 border-white flex items-center justify-center text-[#2E8FAD] font-semibold text-[13px] z-10">
                            {idx + 1}
                          </div>

                          <div className="flex-1 bg-white border border-[#E5E7EB] rounded-[14px] p-5 hover:border-[#2E8FAD]/30 transition-all flex items-center justify-between">
                            <div className="flex items-center gap-6">
                              <div className="space-y-1">
                                <p className="text-[14px] font-semibold text-[#0D2137]">
                                  {step.name || `Étape ${idx + 1}`}
                                </p>
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1.5 text-[12px] text-[#8BAFC0]">
                                    <Clock size={12} />
                                    {step.delayInMinutes === 0
                                      ? "Immédiat"
                                      : `Après ${step.delayInMinutes} min`}
                                  </div>
                                  <div className="w-1 h-1 rounded-full bg-[#E5E7EB]" />
                                  <Badge
                                    variant="neutral"
                                    className="text-[10px] font-medium"
                                  >
                                    {step.channelName ?? step.channelCode ?? "Canal —"}
                                  </Badge>
                                  {step.templateName && (
                                    <Badge
                                      variant="info"
                                      className="text-[10px] font-medium"
                                    >
                                      {step.templateName}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => stepsVm.handleDelete(step.id)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8BAFC0] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {vm.activeTab === "messages" && (
                <Card className="overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-[#E5E7EB] bg-[#F7F8F9] flex items-center justify-between">
                    <div>
                      <h3 className="text-[13px] font-medium text-[#0D2137]">
                        Historique des envois
                      </h3>
                      <p className="text-[12px] text-[#8BAFC0]">
                        Journal détaillé des messages expédiés
                      </p>
                    </div>
                    <Badge variant="neutral" className="text-[11px] font-medium">
                      {fmt(messagesVm.totalCount)} messages
                    </Badge>
                  </div>
                  <DataTable
                    columns={msgColumns}
                    data={messagesVm.messages}
                    loading={messagesVm.isLoading}
                    pagination={{
                      total: messagesVm.totalCount || 0,
                      page: messagesVm.page,
                      pageSize: 50,
                      onPageChange: (p) => messagesVm.setPage(p),
                    }}
                  />
                </Card>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Channel Config Modal */}
      <Modal
        open={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        title="Ajouter un canal"
        size="md"
      >
        <div className="space-y-4 p-1">
          <Select
            label="Choisir le canal"
            options={channelsVm.allChannels.map((c: any) => ({
              value: c.id,
              label: c.name,
            }))}
            value={newConfig.channelId}
            onChange={(e) =>
              setNewConfig((prev) => ({ ...prev, channelId: e.target.value }))
            }
          />
          <Select
            label="Choisir un template"
            options={channelsVm.templates.map((t: any) => ({
              value: t.id,
              label: t.name,
            }))}
            value={newConfig.templateId}
            onChange={(e) =>
              setNewConfig((prev) => ({ ...prev, templateId: e.target.value }))
            }
          />
          <PrioritySelector
            value={newConfig.priority}
            onChange={(v) => setNewConfig((prev) => ({ ...prev, priority: v }))}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setIsConfigOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                channelsVm.handleAdd(newConfig);
                setIsConfigOpen(false);
              }}
              loading={channelsVm.isActionPending}
              disabled={!newConfig.channelId}
            >
              Ajouter au flux
            </Button>
          </div>
        </div>
      </Modal>

      {/* Segment Targeting Modal */}
      <Modal
        open={isSegmentAddOpen}
        onClose={() => setIsSegmentAddOpen(false)}
        title="Cibler un segment"
        size="sm"
      >
        <div className="space-y-4 p-1">
          <Select
            label="Choisir le segment"
            placeholder="Veillez selectionner un segment ..."
            options={segmentsVm.allSegments.map((s: any) => ({
              value: s.id,
              label: s.name,
            }))}
            value={selectedSegmentId}
            onChange={(e) => setSelectedSegmentId(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setIsSegmentAddOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                segmentsVm.handleAdd(selectedSegmentId);
                setIsSegmentAddOpen(false);
                setSelectedSegmentId("");
              }}
              loading={segmentsVm.isActionPending}
              disabled={!selectedSegmentId}
            >
              Confirmer
            </Button>
          </div>
        </div>
      </Modal>

      {/* Global Segment Manager */}
      <SegmentManagerModal
        open={isSegmentManagerOpen}
        onClose={() => setIsSegmentManagerOpen(false)}
        productId={vm.campaign.productId || ""}
      />

      {/* Add Step Modal */}
      <Modal
        open={isStepAddOpen}
        onClose={() => setIsStepAddOpen(false)}
        title="Ajouter une étape"
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsStepAddOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                stepsVm.handleAdd({
                  name: newStep.name,
                  channelId: newStep.channelId,
                  templateId: newStep.templateId || undefined,
                  delayInMinutes: newStep.delayInMinutes,
                  conditions: newStep.conditions || undefined,
                  stepOrder: stepsVm.campaignSteps.length + 1,
                });
                setIsStepAddOpen(false);
                setNewStep({
                  name: "",
                  channelId: "",
                  templateId: "",
                  delayInMinutes: 0,
                  conditions: "",
                });
              }}
              loading={stepsVm.isActionPending}
              disabled={!newStep.channelId || !newStep.name}
            >
              Confirmer
            </Button>
          </div>
        }
      >
        <div className="space-y-4 p-1 relative">
          {/* Champs alignés sur CreateCampaignStepRequest: name, channelId, templateId, delayInMinutes, conditions */}
          <Input
            label="Nom de l'étape *"
            placeholder="Ex: Relance J+1"
            value={newStep.name}
            onChange={(e) =>
              setNewStep((prev) => ({ ...prev, name: e.target.value }))
            }
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Canal *"
              options={[
                { value: "", label: "Sélectionner un canal" },
                ...channelsVm.allChannels.map((c: any) => ({
                  value: c.id,
                  label: c.name,
                })),
              ]}
              value={newStep.channelId}
              onChange={(e) =>
                setNewStep((prev) => ({ ...prev, channelId: e.target.value }))
              }
            />
            <Select
              label="Template"
              options={[
                { value: "", label: "Sans template" },
                ...channelsVm.templates.map((t: any) => ({
                  value: t.id,
                  label: t.name,
                })),
              ]}
              value={newStep.templateId}
              onChange={(e) =>
                setNewStep((prev) => ({ ...prev, templateId: e.target.value }))
              }
            />
          </div>
          <Input
            label="Délai (en minutes)"
            type="number"
            value={newStep.delayInMinutes}
            onChange={(e) =>
              setNewStep((prev) => ({
                ...prev,
                delayInMinutes: parseInt(e.target.value) || 0,
              }))
            }
          />
          <Input
            label="Conditions (expression optionnelle)"
            placeholder="Ex: contact.optIn === true"
            value={newStep.conditions}
            onChange={(e) =>
              setNewStep((prev) => ({ ...prev, conditions: e.target.value }))
            }
          />
        </div>
      </Modal>
    </div>
  );
}
