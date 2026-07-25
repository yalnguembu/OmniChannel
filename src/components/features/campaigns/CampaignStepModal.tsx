import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Toggle } from "@/components/ui/Toggle";
import { cn } from "@/lib/utils";
import {
  getApiClientSegmentDropdownOptions,
  getApiSenderDropdownOptions,
  postApiTemplateSearchOptions,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import type {
  SearchCampaignStepResponse,
  CreateCampaignStepRequest,
} from "@/shared/api/generated/types.gen";
import { useSegmentCriteria } from "@/hooks/useSegmentCriteria";
import { ConditionNodeEditor } from "@/components/features/contacts/ConditionNodeEditor";
import {
  STEP_TYPES,
  STEP_TYPE_LABELS,
  STEP_TYPE_HINTS,
  STEP_TYPE_COLORS,
  START_MODES,
  START_MODE_LABELS,
  REFRESH_MODES,
  REFRESH_MODE_LABELS,
  TARGETING_MODES,
  TARGETING_MODE_LABELS,
  FILTER_SOURCE_MODES,
  FILTER_SOURCE_MODE_LABELS,
  RUN_CONDITIONS,
  RUN_CONDITION_LABELS,
  DEFAULT_RUN_CONDITION,
  defaultConfigFor,
  parseConfig,
  parseDependsOn,
  isSegmentProducing,
  type StepType,
} from "./stepConfig";

interface CampaignStepModalProps {
  open: boolean;
  onClose: () => void;
  productId: string;
  editing: SearchCampaignStepResponse | null;
  nextOrder: number;
  /** All the campaign's steps, ordered — the pool for dependencies + step-segment sources. */
  steps: SearchCampaignStepResponse[];
  onSave: (
    body: Omit<CreateCampaignStepRequest, "campaignId"> & { id?: string },
  ) => Promise<unknown>;
  isSaving?: boolean;
}

export function CampaignStepModal({
  open,
  onClose,
  productId,
  editing,
  nextOrder,
  steps,
  onSave,
  isSaving,
}: CampaignStepModalProps) {
  const [stepType, setStepType] = useState<StepType>("SendMessage");
  const [name, setName] = useState("");
  const [stepOrder, setStepOrder] = useState(nextOrder);
  const [startMode, setStartMode] = useState("afterPrevious");
  const [delayMinutes, setDelayMinutes] = useState(0);
  const [scheduledTime, setScheduledTime] = useState("");
  const [eventCode, setEventCode] = useState("");
  const [cfg, setCfg] = useState<Record<string, any>>({});
  // null = "auto" (depend on the previous step by order) ; [] = root (starts at
  // launch) ; [ids] = explicit dependencies. The three states are distinct on
  // the wire and must stay so — see stepConfig.parseDependsOn.
  const [dependsOn, setDependsOn] = useState<string[] | null>(null);
  const [runCondition, setRunCondition] = useState<string>(DEFAULT_RUN_CONDITION);
  const [continueOnError, setContinueOnError] = useState(false);

  // The FilterSegment criteria builder reuses the segment criteria ViewModel for
  // its catalogs (operators, events, tags, messages, segments) and tree state;
  // only the persistence differs — the tree is embedded in the step's configJson.
  const criteriaVm = useSegmentCriteria(productId, null, {
    enabled: open && stepType === "FilterSegment",
  });

  const { data: segments = [] } = useQuery({
    ...getApiClientSegmentDropdownOptions({ query: { productid: productId } }),
    select: (res) =>
      (res?.data ?? []) as { id?: string; name?: string | null }[],
    enabled: open,
  });
  const { data: senders = [] } = useQuery({
    ...getApiSenderDropdownOptions(),
    select: (res) =>
      (res?.data ?? []) as { id?: string; displayName?: string | null }[],
    enabled: open,
  });
  const { data: templates = [] } = useQuery({
    ...postApiTemplateSearchOptions({
      body: { productId, pageSize: 100 } as any,
    }),
    select: (res) =>
      (res?.data?.items ?? []) as {
        id?: string;
        name?: string | null;
      }[],
    enabled: open,
  });

  useEffect(() => {
    if (!open) return;
    const t = (editing?.stepType as StepType) || "SendMessage";
    const resolved = STEP_TYPES.includes(t) ? t : "SendMessage";
    setStepType(resolved);
    setName(editing?.name || "");
    setStepOrder(editing?.stepOrder ?? nextOrder);
    setStartMode(editing?.startMode || "afterPrevious");
    setDelayMinutes(editing?.delayMinutes ?? 0);
    setScheduledTime(editing?.scheduledTime || "");
    setEventCode(editing?.eventCode || "");
    setDependsOn(parseDependsOn(editing?.dependsOnJson));
    setRunCondition(editing?.runCondition || DEFAULT_RUN_CONDITION);
    setContinueOnError(!!editing?.continueOnError);
    const config = editing?.configJson
      ? parseConfig(editing.configJson)
      : defaultConfigFor(resolved);
    setCfg(config);
    // criteriaJson is itself a JSON *string* nested inside configJson.
    criteriaVm.loadWireCriteria(
      resolved === "FilterSegment" ? (config.criteriaJson as string) ?? "" : "",
    );
    // criteriaVm identity changes every render; seeding is keyed on the step.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing, nextOrder]);

  const changeType = (t: StepType) => {
    setStepType(t);
    setCfg(defaultConfigFor(t));
    if (t === "FilterSegment") criteriaVm.loadWireCriteria("");
    if (!name.trim() || Object.values(STEP_TYPE_LABELS).includes(name.trim()))
      setName(STEP_TYPE_LABELS[t]);
  };

  const setField = (k: string, v: unknown) => setCfg((c) => ({ ...c, [k]: v }));

  // Steps selectable as a dependency / as a step-segment source. The step being
  // edited is excluded (a step can't depend on itself — the backend refuses
  // cycles anyway), and a brand-new step has no id yet so it isn't in `steps`.
  const otherSteps = steps.filter((s) => s.id && s.id !== editing?.id);
  const producerSteps = otherSteps.filter((s) => isSegmentProducing(s.stepType));
  const stepIndex = (id?: string | null) =>
    steps.findIndex((s) => s.id === id);
  const stepLabel = (s: SearchCampaignStepResponse) =>
    `#${stepIndex(s.id) + 1} ${s.name || s.stepType || "Étape"}`;

  const toggleDependency = (id: string) =>
    setDependsOn((prev) => {
      const arr = prev ? [...prev] : [];
      return arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];
    });

  const buildConfig = (): Record<string, unknown> => {
    if (stepType === "RefreshClients") {
      const mode = cfg.mode || "refreshSegment";
      const o: Record<string, unknown> = { mode, sync: cfg.sync !== false };
      if (mode === "refreshSegment") o.segmentId = cfg.segmentId || null;
      if (mode === "fetchByExternalIds")
        o.sourceSegmentId = cfg.sourceSegmentId || null;
      if (mode === "fetchByCode") o.code = cfg.code || null;
      if (cfg.targetSegmentName) o.targetSegmentName = cfg.targetSegmentName;
      return o;
    }
    if (stepType === "SendMessage") {
      const mode = cfg.targeting?.mode || "segment";
      const targeting: Record<string, unknown> = { mode };
      if (mode === "segment") targeting.segmentId = cfg.targeting?.segmentId || null;
      if (mode === "stepSegment" && cfg.targeting?.sourceStepId)
        targeting.sourceStepId = cfg.targeting.sourceStepId;
      return {
        templateId: cfg.templateId || null,
        senderId: cfg.senderId || null,
        targeting,
      };
    }
    if (stepType === "FilterSegment") {
      const mode = cfg.sourceMode || "stepSegment";
      const o: Record<string, unknown> = { sourceMode: mode };
      if (mode === "segment") o.sourceSegmentId = cfg.sourceSegmentId || null;
      else o.sourceStepId = cfg.sourceStepId || null;
      o.criteriaJson = JSON.stringify(criteriaVm.getWireCriteria());
      if (cfg.targetSegmentName) o.targetSegmentName = cfg.targetSegmentName;
      return o;
    }
    return {};
  };

  const save = async () => {
    if (!name.trim()) return toast.error("Le nom de l'étape est requis");
    if (stepType === "SendMessage" && !cfg.templateId)
      return toast.error("Un template est requis pour l'envoi");
    if (
      stepType === "FilterSegment" &&
      (cfg.sourceMode || "stepSegment") === "segment" &&
      !cfg.sourceSegmentId
    )
      return toast.error("Un segment source est requis pour le filtre");
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
      dependsOn,
      runCondition,
      continueOnError,
    });
    onClose();
  };

  const segmentOptions = [
    { value: "", label: "Sélectionner un segment…" },
    ...segments
      .filter((s) => s.id)
      .map((s) => ({ value: s.id as string, label: s.name ?? "—" })),
  ];
  const producerStepOptions = [
    { value: "", label: "— Étape source —" },
    ...producerSteps.map((s) => ({ value: s.id as string, label: stepLabel(s) })),
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
        {/* Step type — cards, so each type's purpose is legible up front */}
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {STEP_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => changeType(t)}
              className={cn(
                "rounded-[10px] border p-2.5 text-left transition-all",
                stepType === t
                  ? "border-transparent bg-white shadow-[0_0_0_2px_var(--tw-shadow-color)]"
                  : "border-[#E5E7EB] bg-white hover:border-[#B8CDD8]",
              )}
              style={
                stepType === t
                  ? ({ "--tw-shadow-color": STEP_TYPE_COLORS[t] } as React.CSSProperties)
                  : undefined
              }
            >
              <span
                className="block text-[12.5px] font-semibold"
                style={{ color: stepType === t ? STEP_TYPE_COLORS[t] : "#0D2137" }}
              >
                {STEP_TYPE_LABELS[t]}
              </span>
              <span className="mt-0.5 block text-[10.5px] leading-snug text-[#8BAFC0]">
                {STEP_TYPE_HINTS[t]}
              </span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Input
            label="Ordre"
            type="number"
            value={stepOrder.toString()}
            onChange={(e) => setStepOrder(parseInt(e.target.value) || 0)}
          />
          <div className="md:col-span-2">
            <Input
              label="Nom de l'étape *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Rafraîchir j0"
            />
          </div>
        </div>

        {/* Dependencies — this is what actually orders the execution graph */}
        <div className="space-y-2 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4">
          <div>
            <h4 className="text-[13px] font-semibold text-[#0D2137]">
              Dépendances
            </h4>
            <p className="text-[11.5px] leading-relaxed text-[#8BAFC0]">
              Les étapes qui partagent une dépendance s'exécutent en parallèle ;
              plusieurs dépendances = l'étape les rejoint (fan-in).
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <DepChip
              active={dependsOn == null}
              onClick={() => setDependsOn(null)}
              label="Auto (précédente)"
            />
            <DepChip
              active={dependsOn != null && dependsOn.length === 0}
              onClick={() => setDependsOn([])}
              label="Racine (début)"
            />
            {otherSteps.map((s) => (
              <DepChip
                key={s.id}
                active={!!dependsOn?.includes(s.id as string)}
                onClick={() => toggleDependency(s.id as string)}
                label={stepLabel(s)}
              />
            ))}
          </div>
          {otherSteps.length === 0 && (
            <p className="text-[11.5px] italic text-[#8BAFC0]">
              Aucune autre étape enregistrée — celle-ci démarrera au lancement.
            </p>
          )}
          <div className="grid grid-cols-1 gap-3 pt-1 md:grid-cols-2">
            <Select
              label="Condition d'exécution"
              value={runCondition}
              onChange={(e) => setRunCondition(e.target.value)}
              options={RUN_CONDITIONS.map((c) => ({
                value: c,
                label: RUN_CONDITION_LABELS[c],
              }))}
            />
            <div className="flex items-center gap-2 pt-6">
              <Toggle checked={continueOnError} onChange={setContinueOnError} />
              <span className="text-[12.5px] text-[#4A7A94]">
                Échec absorbé (continueOnError)
              </span>
            </div>
          </div>
        </div>

        {/* Start mode */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Select
            label="Démarrage"
            value={startMode}
            onChange={(e) => setStartMode(e.target.value)}
            options={START_MODES.map((m) => ({
              value: m,
              label: START_MODE_LABELS[m],
            }))}
          />
          {startMode === "afterPrevious" && (
            <Input
              label="Délai (min)"
              type="number"
              value={delayMinutes.toString()}
              onChange={(e) => setDelayMinutes(parseInt(e.target.value) || 0)}
            />
          )}
          {startMode === "atTime" && (
            <Input
              label="Heure (HH:mm)"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              placeholder="09:00"
            />
          )}
          {startMode === "afterEvent" && (
            <Input
              label="Code événement"
              value={eventCode}
              onChange={(e) => setEventCode(e.target.value)}
              placeholder="reabo_request"
            />
          )}
        </div>

        {/* Per-type config */}
        <div className="space-y-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4">
          <h4 className="text-[13px] font-semibold text-[#0D2137]">
            Configuration
          </h4>

          {stepType === "RefreshClients" && (
            <>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Select
                  label="Mode"
                  value={cfg.mode || "refreshSegment"}
                  onChange={(e) => setField("mode", e.target.value)}
                  options={REFRESH_MODES.map((m) => ({
                    value: m,
                    label: REFRESH_MODE_LABELS[m],
                  }))}
                />
                <div className="flex items-center gap-2 pt-6">
                  <Toggle
                    checked={cfg.sync !== false}
                    onChange={(v) => setField("sync", v)}
                  />
                  <span className="text-[12.5px] text-[#4A7A94]">
                    Synchrone
                  </span>
                </div>
              </div>
              {cfg.mode === "fetchByCode" && (
                <Input
                  label="Code"
                  value={cfg.code || ""}
                  onChange={(e) => setField("code", e.target.value)}
                  placeholder="j0 / j3"
                />
              )}
              {cfg.mode === "fetchByExternalIds" && (
                <Select
                  label="Segment source"
                  value={cfg.sourceSegmentId || ""}
                  onChange={(e) => setField("sourceSegmentId", e.target.value)}
                  options={segmentOptions}
                />
              )}
              {(cfg.mode || "refreshSegment") === "refreshSegment" && (
                <Select
                  label="Segment à recalculer"
                  value={cfg.segmentId || ""}
                  onChange={(e) => setField("segmentId", e.target.value)}
                  options={segmentOptions}
                />
              )}
              {(cfg.mode || "refreshSegment") !== "refreshSegment" && (
                <Input
                  label="Nom du segment produit (optionnel)"
                  value={cfg.targetSegmentName || ""}
                  onChange={(e) => setField("targetSegmentName", e.target.value)}
                />
              )}
            </>
          )}

          {stepType === "SendMessage" && (
            <>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Select
                  label="Template *"
                  value={cfg.templateId || ""}
                  onChange={(e) => setField("templateId", e.target.value)}
                  options={[
                    { value: "", label: "Sélectionner un template…" },
                    ...templates
                      .filter((t) => t.id)
                      .map((t) => ({
                        value: t.id as string,
                        label: t.name ?? "—",
                      })),
                  ]}
                />
                <Select
                  label="Sender (optionnel)"
                  value={cfg.senderId || ""}
                  onChange={(e) => setField("senderId", e.target.value)}
                  options={[
                    { value: "", label: "Aucun" },
                    ...senders
                      .filter((s) => s.id)
                      .map((s) => ({
                        value: s.id as string,
                        label: s.displayName ?? "—",
                      })),
                  ]}
                />
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Select
                  label="Ciblage"
                  value={cfg.targeting?.mode || "segment"}
                  onChange={(e) =>
                    setField("targeting", {
                      ...cfg.targeting,
                      mode: e.target.value,
                    })
                  }
                  options={TARGETING_MODES.map((m) => ({
                    value: m,
                    label: TARGETING_MODE_LABELS[m],
                  }))}
                />
                {(cfg.targeting?.mode || "segment") === "segment" ? (
                  <Select
                    label="Segment"
                    value={cfg.targeting?.segmentId || ""}
                    onChange={(e) =>
                      setField("targeting", {
                        ...cfg.targeting,
                        segmentId: e.target.value,
                      })
                    }
                    options={segmentOptions}
                  />
                ) : (
                  <Select
                    label="Étape source du segment"
                    value={cfg.targeting?.sourceStepId || ""}
                    onChange={(e) =>
                      setField("targeting", {
                        ...cfg.targeting,
                        sourceStepId: e.target.value,
                      })
                    }
                    options={producerStepOptions}
                  />
                )}
              </div>
              {(cfg.targeting?.mode || "segment") === "stepSegment" && (
                <p className="text-[11.5px] leading-relaxed text-[#8BAFC0]">
                  Sans étape source explicite, l'envoi cible le segment produit le
                  plus récent en amont.
                </p>
              )}
            </>
          )}

          {stepType === "FilterSegment" && (
            <>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Select
                  label="Source"
                  value={cfg.sourceMode || "stepSegment"}
                  onChange={(e) => setField("sourceMode", e.target.value)}
                  options={FILTER_SOURCE_MODES.map((m) => ({
                    value: m,
                    label: FILTER_SOURCE_MODE_LABELS[m],
                  }))}
                />
                {(cfg.sourceMode || "stepSegment") === "segment" ? (
                  <Select
                    label="Segment source *"
                    value={cfg.sourceSegmentId || ""}
                    onChange={(e) => setField("sourceSegmentId", e.target.value)}
                    options={segmentOptions}
                  />
                ) : (
                  <Select
                    label="Étape source"
                    value={cfg.sourceStepId || ""}
                    onChange={(e) => setField("sourceStepId", e.target.value)}
                    options={producerStepOptions}
                  />
                )}
              </div>
              <Input
                label="Nom du segment produit (optionnel)"
                value={cfg.targetSegmentName || ""}
                onChange={(e) => setField("targetSegmentName", e.target.value)}
              />
              <div className="space-y-2">
                <div>
                  <h5 className="text-[12.5px] font-semibold text-[#0D2137]">
                    Critère de filtrage
                  </h5>
                  <p className="text-[11.5px] text-[#8BAFC0]">
                    Les clients de la source qui satisfont ce critère forment le
                    segment statique produit par l'étape.
                  </p>
                </div>
                {criteriaVm.isLoading ? (
                  <p className="py-4 text-center text-[12px] text-[#8BAFC0]">
                    Chargement du catalogue de conditions…
                  </p>
                ) : (
                  <ConditionNodeEditor
                    node={criteriaVm.criteria}
                    path={[]}
                    vm={criteriaVm}
                    allowEventTag
                  />
                )}
              </div>
            </>
          )}

          {stepType === "Wait" && (
            <p className="text-[12px] text-[#8BAFC0]">
              L'étape d'attente est pilotée par le mode de démarrage / le délai
              ci-dessus.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}

/** Multi-select chip for the dependency picker. */
function DepChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-[8px] border px-2.5 py-1 text-[11.5px] font-medium transition-colors",
        active
          ? "border-[#2E8FAD] bg-[#2E8FAD] text-white"
          : "border-[#E5E7EB] bg-white text-[#4A7A94] hover:border-[#B8CDD8]",
      )}
    >
      {label}
    </button>
  );
}
