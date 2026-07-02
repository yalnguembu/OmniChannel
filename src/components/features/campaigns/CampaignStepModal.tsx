import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Toggle } from "@/components/ui/Toggle";
import {
  getApiClientSegmentDropdownOptions,
  getApiSenderDropdownOptions,
  postApiTemplateSearchOptions,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import type {
  SearchCampaignStepResponse,
  CreateCampaignStepRequest,
} from "@/shared/api/generated/types.gen";
import {
  STEP_TYPES,
  STEP_TYPE_LABELS,
  START_MODES,
  START_MODE_LABELS,
  REFRESH_MODES,
  REFRESH_MODE_LABELS,
  TARGETING_MODES,
  TARGETING_MODE_LABELS,
  defaultConfigFor,
  parseConfig,
  type StepType,
} from "./stepConfig";

interface CampaignStepModalProps {
  open: boolean;
  onClose: () => void;
  productId: string;
  editing: SearchCampaignStepResponse | null;
  nextOrder: number;
  onSave: (body: Omit<CreateCampaignStepRequest, "campaignId"> & { id?: string }) => Promise<unknown>;
  isSaving?: boolean;
}

export function CampaignStepModal({
  open,
  onClose,
  productId,
  editing,
  nextOrder,
  onSave,
  isSaving,
}: CampaignStepModalProps) {
  const [stepType, setStepType] = useState<StepType>("RefreshClients");
  const [name, setName] = useState("");
  const [stepOrder, setStepOrder] = useState(nextOrder);
  const [startMode, setStartMode] = useState("afterPrevious");
  const [delayMinutes, setDelayMinutes] = useState(0);
  const [scheduledTime, setScheduledTime] = useState("");
  const [eventCode, setEventCode] = useState("");
  const [cfg, setCfg] = useState<Record<string, any>>({});

  const { data: segments = [] } = useQuery({
    ...getApiClientSegmentDropdownOptions({ query: { productid: productId } }),
    select: (res) => (res?.data ?? []) as { id?: string; name?: string | null }[],
    enabled: open,
  });
  const { data: senders = [] } = useQuery({
    ...getApiSenderDropdownOptions(),
    select: (res) => (res?.data ?? []) as { id?: string; name?: string | null }[],
    enabled: open,
  });
  const { data: templates = [] } = useQuery({
    ...postApiTemplateSearchOptions({ body: { productId, pageSize: 100 } as any }),
    select: (res) => (res?.data?.items ?? []) as { id?: string; name?: string | null }[],
    enabled: open,
  });

  useEffect(() => {
    if (!open) return;
    const t = (editing?.stepType as StepType) || "RefreshClients";
    setStepType(STEP_TYPES.includes(t) ? t : "RefreshClients");
    setName(editing?.name || "");
    setStepOrder(editing?.stepOrder ?? nextOrder);
    setStartMode(editing?.startMode || "afterPrevious");
    setDelayMinutes(editing?.delayMinutes ?? 0);
    setScheduledTime(editing?.scheduledTime || "");
    setEventCode(editing?.eventCode || "");
    setCfg(
      editing?.configJson
        ? parseConfig(editing.configJson)
        : defaultConfigFor(t),
    );
  }, [open, editing, nextOrder]);

  const changeType = (t: StepType) => {
    setStepType(t);
    setCfg(defaultConfigFor(t));
  };

  const setField = (k: string, v: unknown) => setCfg((c) => ({ ...c, [k]: v }));

  const buildConfig = (): Record<string, unknown> => {
    if (stepType === "RefreshClients") {
      const o: Record<string, unknown> = { mode: cfg.mode || "fetchByCode", sync: cfg.sync !== false };
      if (cfg.mode === "fetchByCode" && cfg.code) o.code = cfg.code;
      if (cfg.mode === "fetchByExternalIds" && cfg.sourceSegmentId) o.sourceSegmentId = cfg.sourceSegmentId;
      if (cfg.mode === "refreshSegment" && cfg.segmentId) o.segmentId = cfg.segmentId;
      if (cfg.targetSegmentName) o.targetSegmentName = cfg.targetSegmentName;
      return o;
    }
    if (stepType === "SendMessage") {
      const mode = cfg.targeting?.mode || "stepSegment";
      const targeting: Record<string, unknown> = { mode };
      if (mode === "segment" && cfg.targeting?.segmentId) targeting.segmentId = cfg.targeting.segmentId;
      return { templateId: cfg.templateId || "", senderId: cfg.senderId || undefined, targeting };
    }
    return {};
  };

  const save = async () => {
    if (!name.trim()) return toast.error("Le nom de l'étape est requis");
    if (stepType === "SendMessage" && !cfg.templateId)
      return toast.error("Un template est requis pour l'envoi");
    await onSave({
      id: editing?.id,
      stepOrder,
      name: name.trim(),
      stepType,
      configJson: JSON.stringify(buildConfig()),
      startMode,
      delayMinutes: startMode === "afterPrevious" ? delayMinutes : null,
      scheduledTime: startMode === "atTime" ? scheduledTime || null : null,
      eventCode: startMode === "afterEvent" ? eventCode || null : null,
    });
    onClose();
  };

  const segmentOptions = [
    { value: "", label: "Sélectionner un segment…" },
    ...segments.filter((s) => s.id).map((s) => ({ value: s.id as string, label: s.name ?? "—" })),
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Modifier l'étape" : "Nouvelle étape"}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            Annuler
          </Button>
          <Button variant="primary" onClick={save} loading={isSaving}>
            {editing ? "Enregistrer" : "Ajouter l'étape"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input label="Ordre" type="number" value={stepOrder.toString()} onChange={(e) => setStepOrder(parseInt(e.target.value) || 0)} />
          <div className="md:col-span-2">
            <Input label="Nom de l'étape *" value={name} onChange={(e) => setName(e.target.value)} placeholder="ex: Rafraîchir j0" />
          </div>
        </div>

        <Select
          label="Type d'étape"
          value={stepType}
          onChange={(e) => changeType(e.target.value as StepType)}
          options={STEP_TYPES.map((t) => ({ value: t, label: STEP_TYPE_LABELS[t] }))}
        />

        {/* Start mode */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Select
            label="Démarrage"
            value={startMode}
            onChange={(e) => setStartMode(e.target.value)}
            options={START_MODES.map((m) => ({ value: m, label: START_MODE_LABELS[m] }))}
          />
          {startMode === "afterPrevious" && (
            <Input label="Délai (min)" type="number" value={delayMinutes.toString()} onChange={(e) => setDelayMinutes(parseInt(e.target.value) || 0)} />
          )}
          {startMode === "atTime" && (
            <Input label="Heure (HH:mm)" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} placeholder="09:00" />
          )}
          {startMode === "afterEvent" && (
            <Input label="Code événement" value={eventCode} onChange={(e) => setEventCode(e.target.value)} placeholder="reabo_request" />
          )}
        </div>

        {/* Per-type config */}
        <div className="border border-[#E5E7EB] rounded-lg p-4 bg-[#F9FAFB] space-y-3">
          <h4 className="text-[13px] font-semibold text-[#0D2137]">Configuration</h4>

          {stepType === "RefreshClients" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Select
                  label="Mode"
                  value={cfg.mode || "fetchByCode"}
                  onChange={(e) => setField("mode", e.target.value)}
                  options={REFRESH_MODES.map((m) => ({ value: m, label: REFRESH_MODE_LABELS[m] }))}
                />
                <div className="flex items-center gap-2 pt-6">
                  <Toggle checked={cfg.sync !== false} onChange={(v) => setField("sync", v)} />
                  <span className="text-[12.5px] text-[#4A7A94]">Synchrone</span>
                </div>
              </div>
              {cfg.mode === "fetchByCode" && (
                <Input label="Code" value={cfg.code || ""} onChange={(e) => setField("code", e.target.value)} placeholder="j0 / j3" />
              )}
              {cfg.mode === "fetchByExternalIds" && (
                <Select label="Segment source" value={cfg.sourceSegmentId || ""} onChange={(e) => setField("sourceSegmentId", e.target.value)} options={segmentOptions} />
              )}
              {cfg.mode === "refreshSegment" && (
                <Select label="Segment à recalculer" value={cfg.segmentId || ""} onChange={(e) => setField("segmentId", e.target.value)} options={segmentOptions} />
              )}
              <Input label="Nom du segment produit (optionnel)" value={cfg.targetSegmentName || ""} onChange={(e) => setField("targetSegmentName", e.target.value)} />
            </>
          )}

          {stepType === "SendMessage" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Select
                  label="Template *"
                  value={cfg.templateId || ""}
                  onChange={(e) => setField("templateId", e.target.value)}
                  options={[
                    { value: "", label: "Sélectionner un template…" },
                    ...templates.filter((t) => t.id).map((t) => ({ value: t.id as string, label: t.name ?? "—" })),
                  ]}
                />
                <Select
                  label="Sender (optionnel)"
                  value={cfg.senderId || ""}
                  onChange={(e) => setField("senderId", e.target.value)}
                  options={[
                    { value: "", label: "Aucun" },
                    ...senders.filter((s) => s.id).map((s) => ({ value: s.id as string, label: s.name ?? "—" })),
                  ]}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Select
                  label="Ciblage"
                  value={cfg.targeting?.mode || "stepSegment"}
                  onChange={(e) => setField("targeting", { ...cfg.targeting, mode: e.target.value })}
                  options={TARGETING_MODES.map((m) => ({ value: m, label: TARGETING_MODE_LABELS[m] }))}
                />
                {cfg.targeting?.mode === "segment" && (
                  <Select
                    label="Segment"
                    value={cfg.targeting?.segmentId || ""}
                    onChange={(e) => setField("targeting", { ...cfg.targeting, segmentId: e.target.value })}
                    options={segmentOptions}
                  />
                )}
              </div>
            </>
          )}

          {stepType === "Wait" && (
            <p className="text-[12px] text-[#8BAFC0]">
              L'étape d'attente est pilotée par le mode de démarrage / le délai ci-dessus.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
