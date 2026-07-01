import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Edit, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { PageLoader } from "@/components/feedback/PageLoader";
import { getApiEventDefinitionByIdOptions } from "@/shared/api/generated/@tanstack/react-query.gen";
import { useProductEvents } from "@/hooks/useProductEvents";
import { useEventTriggers } from "@/hooks/useEventTriggers";
import { EventInfoModal } from "@/components/features/events/EventInfoModal";
import { EventMatchRuleModal } from "@/components/features/events/EventMatchRuleModal";
import { EventCaptureSpecModal } from "@/components/features/events/EventCaptureSpecModal";
import { TriggerFormModal } from "@/components/features/events/TriggerFormModal";
import { EventTriggerCard } from "@/components/features/events/EventTriggerCard";
import type { EventDefinitionDto, TriggerDto } from "@/shared/api/generated/types.gen";

interface EventDetailPageProps {
  productId: string;
  eventId: string;
}

export function EventDetailPage({ productId, eventId }: EventDetailPageProps) {
  const navigate = useNavigate();
  const vm = useProductEvents(productId);
  const { triggers, isLoading: triggersLoading, createTrigger, updateTrigger, deleteTrigger } =
    useEventTriggers(eventId);

  const eventQuery = useQuery({
    ...getApiEventDefinitionByIdOptions({ path: { id: eventId } }),
    select: (res) => res?.data as EventDefinitionDto | undefined,
    enabled: !!eventId,
  });
  const event = eventQuery.data;

  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [matchRuleModalOpen, setMatchRuleModalOpen] = useState(false);
  const [captureSpecModalOpen, setCaptureSpecModalOpen] = useState(false);
  const [triggerModalOpen, setTriggerModalOpen] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState<TriggerDto | null>(null);

  const goBack = () => navigate({ to: "/$productId/events", params: { productId } });

  const openCreateTrigger = () => {
    setEditingTrigger(null);
    setTriggerModalOpen(true);
  };
  const openEditTrigger = (trigger: TriggerDto) => {
    setEditingTrigger(trigger);
    setTriggerModalOpen(true);
  };

  const handleSaveTrigger = async (data: Partial<TriggerDto>) => {
    if (editingTrigger) {
      await updateTrigger({ body: { id: editingTrigger.id, eventDefinitionId: eventId, ...data } });
    } else {
      await createTrigger({ body: { eventDefinitionId: eventId, ...data } });
    }
  };

  if (eventQuery.isLoading) {
    return (
      <div className="py-20">
        <PageLoader />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="py-20 text-center text-[13px] text-[#8BAFC0]">
        Événement introuvable.
        <div className="mt-4">
          <Button variant="secondary" size="sm" onClick={goBack}>
            <ArrowLeft size={13} /> Retour aux événements
          </Button>
        </div>
      </div>
    );
  }

  let matchRule: { type?: string; values?: string[] } | null = null;
  try {
    matchRule = event.matchRule ? JSON.parse(event.matchRule) : null;
  } catch {
    matchRule = null;
  }

  let captures: { name: string; source: string; resultType?: string }[] = [];
  try {
    captures = event.captureSpec ? JSON.parse(event.captureSpec).captures ?? [] : [];
  } catch {
    captures = [];
  }

  return (
    <div className="space-y-5">
      <button
        onClick={goBack}
        className="flex items-center gap-2 text-[12.5px] text-[#8BAFC0] hover:text-[#0D2137] transition-colors"
      >
        <ArrowLeft size={13} /> Événements
      </button>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[20px] font-semibold text-[#0D2137] tracking-tight">
              {event.label || "Événement sans nom"}
            </h1>
            <Badge variant={event.origin === "External" ? "purple" : "info"}>
              {event.origin}
            </Badge>
            {!event.isActive && <Badge variant="warning">Inactif</Badge>}
          </div>
          <p className="text-[12.5px] font-mono text-[#8BAFC0] mt-1">{event.code}</p>
        </div>
        <Button variant="secondary" onClick={() => setInfoModalOpen(true)}>
          <Edit size={13} /> Modifier
        </Button>
      </div>

      {event.origin === "Internal" && (
        <Card>
          <CardHeader
            title="Règle de détection (MatchRule)"
            action={<span onClick={() => setMatchRuleModalOpen(true)}>Modifier</span>}
          />
          <CardBody>
            {matchRule ? (
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="info">{matchRule.type}</Badge>
                {(matchRule.values ?? []).map((v, i) => (
                  <span
                    key={i}
                    className="text-[12px] px-2 py-1 rounded-md bg-[#F0F2F4] text-[#4A7A94]"
                  >
                    {v}
                  </span>
                ))}
                {(matchRule.values ?? []).length === 0 && (
                  <span className="text-[12px] text-[#8BAFC0] italic">Aucune valeur définie.</span>
                )}
              </div>
            ) : (
              <p className="text-[12px] text-[#8BAFC0] italic">Aucune règle définie.</p>
            )}
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader
          title="Extractions (CaptureSpec)"
          action={<span onClick={() => setCaptureSpecModalOpen(true)}>Modifier</span>}
        />
        <CardBody>
          {captures.length === 0 ? (
            <p className="text-[12px] text-[#8BAFC0] italic">Aucune extraction configurée.</p>
          ) : (
            <div className="space-y-2">
              {captures.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border border-[#E5E7EB] rounded-md px-3 py-2"
                >
                  <span className="text-[12.5px] font-mono text-[#0D2137]">{c.name}</span>
                  <span className="text-[11px] text-[#8BAFC0]">
                    {c.source} · {c.resultType || "String"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Triggers"
          action={
            <span onClick={openCreateTrigger} className="flex items-center gap-1">
              <Plus size={12} /> Ajouter un trigger
            </span>
          }
        />
        <CardBody className="space-y-3">
          {triggersLoading && <p className="text-[13px] text-[#8BAFC0]">Chargement des triggers...</p>}
          {!triggersLoading && triggers.length === 0 && (
            <p className="text-[13px] text-[#8BAFC0] text-center py-4">
              Aucun trigger configuré pour cet événement.
            </p>
          )}
          {triggers.map((trigger) => (
            <EventTriggerCard
              key={trigger.id}
              trigger={trigger}
              onEdit={() => openEditTrigger(trigger)}
              onDelete={() => deleteTrigger({ path: { id: trigger.id! } })}
            />
          ))}
        </CardBody>
      </Card>

      <EventInfoModal
        open={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        productId={productId}
        editing={event}
        onSave={async (data) => {
          await vm.updateEvent(data);
          eventQuery.refetch();
        }}
        isSaving={vm.isMutating}
      />
      <EventMatchRuleModal
        open={matchRuleModalOpen}
        onClose={() => setMatchRuleModalOpen(false)}
        event={event}
        metadata={vm.metadata}
        onValidate={vm.validateMatchRule}
        onSave={async (data) => {
          await vm.updateEvent(data);
          eventQuery.refetch();
        }}
        isSaving={vm.isMutating}
      />
      <EventCaptureSpecModal
        open={captureSpecModalOpen}
        onClose={() => setCaptureSpecModalOpen(false)}
        event={event}
        onSave={async (data) => {
          await vm.updateEvent(data);
          eventQuery.refetch();
        }}
        isSaving={vm.isMutating}
      />
      <TriggerFormModal
        open={triggerModalOpen}
        onClose={() => setTriggerModalOpen(false)}
        event={event}
        trigger={editingTrigger ?? undefined}
        metadata={vm.metadata}
        onValidateCondition={vm.validateCondition}
        onSave={handleSaveTrigger}
      />
    </div>
  );
}
