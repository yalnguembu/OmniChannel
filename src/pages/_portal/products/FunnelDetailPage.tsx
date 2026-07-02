import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Edit, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { PageLoader } from "@/components/feedback/PageLoader";
import { useProductFunnels } from "@/hooks/useProductFunnels";
import { useFunnelSteps } from "@/hooks/useFunnelSteps";
import {
  postApiEventDefinitionSearchOptions,
  getApiEventFunnelByIdOptions,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import { FunnelFormModal } from "@/components/features/products/FunnelFormModal";
import { FunnelStepModal } from "@/components/features/products/funnels/FunnelStepModal";
import { FunnelTimeline } from "@/components/features/products/funnels/FunnelTimeline";
import type { EventFunnelDto, EventFunnelStepDto } from "@/shared/api/generated/types.gen";

interface FunnelDetailPageProps {
  productId: string;
  funnelId: string;
}

export function FunnelDetailPage({ productId, funnelId }: FunnelDetailPageProps) {
  const navigate = useNavigate();
  const vm = useProductFunnels(productId);
  const { steps, isLoading: stepsLoading, createStep, updateStep, deleteStep } = useFunnelSteps(funnelId);

  // Load the funnel by its id — the search list is paginated, so scanning
  // vm.data.items would miss any funnel not on the first page (and break a
  // direct URL / refresh entirely).
  const funnelQuery = useQuery({
    ...getApiEventFunnelByIdOptions({ path: { id: funnelId } }),
    select: (res) => res?.data as EventFunnelDto | undefined,
    enabled: !!funnelId,
  });
  const funnel = funnelQuery.data;

  const { data: events = [] } = useQuery({
    ...postApiEventDefinitionSearchOptions({
      body: { productId, pageSize: 100 } as any,
    }),
    select: (res) => res?.data?.items ?? [],
  });
  const getEventName = (id?: string | null) =>
    events.find((e) => e.id === id)?.label || events.find((e) => e.id === id)?.code || "Événement inconnu";

  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [stepModalOpen, setStepModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<EventFunnelStepDto | null>(null);

  const goBack = () => navigate({ to: "/$productId/funnels", params: { productId } });

  const openCreateStep = () => {
    setEditingStep(null);
    setStepModalOpen(true);
  };
  const openEditStep = (step: EventFunnelStepDto) => {
    setEditingStep(step);
    setStepModalOpen(true);
  };

  const handleSaveStep = async (data: Partial<EventFunnelStepDto>) => {
    if (editingStep) {
      await updateStep({ body: { id: editingStep.id, funnelId, ...data } });
    } else {
      await createStep({ body: { funnelId, ...data } });
    }
  };

  const handleSaveInfo = async (data: any) => {
    await vm.updateFunnel({ body: { ...data, id: funnelId } });
    funnelQuery.refetch();
  };

  if (funnelQuery.isLoading) {
    return (
      <div className="py-20">
        <PageLoader />
      </div>
    );
  }

  if (!funnel) {
    return (
      <div className="py-20 text-center text-[13px] text-[#8BAFC0]">
        Tunnel introuvable.
        <div className="mt-4">
          <Button variant="secondary" size="sm" onClick={goBack}>
            <ArrowLeft size={13} /> Retour aux tunnels
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <button
        onClick={goBack}
        className="flex items-center gap-2 text-[12.5px] text-[#8BAFC0] hover:text-[#0D2137] transition-colors"
      >
        <ArrowLeft size={13} /> Tunnels
      </button>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[20px] font-semibold text-[#0D2137] tracking-tight">
              {funnel.name || "Sans nom"}
            </h1>
            {!funnel.isActive && <Badge variant="warning">Inactif</Badge>}
          </div>
          <p className="text-[12.5px] font-mono text-[#8BAFC0] mt-1">{funnel.code}</p>
        </div>
        <Button variant="secondary" onClick={() => setInfoModalOpen(true)}>
          <Edit size={13} /> Modifier
        </Button>
      </div>

      <Card>
        <CardHeader
          title="Étapes"
          action={
            <span onClick={openCreateStep} className="flex items-center gap-1">
              <Plus size={12} /> Ajouter une étape
            </span>
          }
        />
        <CardBody className="space-y-2">
          {stepsLoading && <p className="text-[13px] text-[#8BAFC0]">Chargement des étapes...</p>}
          {!stepsLoading && steps.length === 0 && (
            <p className="text-[13px] text-[#8BAFC0] text-center py-4">
              Aucune étape configurée.
            </p>
          )}
          {steps.map((step) => (
            <div
              key={step.id}
              className="flex items-center justify-between p-3 border border-[#E5E7EB] bg-white rounded-md"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F3F4F6] text-[12px] font-semibold text-[#4A7A94]">
                  {step.orderIndex}
                </span>
                <div>
                  <h5 className="text-[13px] font-semibold text-[#0D2137]">
                    {step.label || "Sans nom"}
                  </h5>
                  <p className="text-[11px] text-[#8BAFC0] mt-0.5">
                    Événement : {getEventName(step.eventDefinitionId)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => openEditStep(step)}>
                  <Edit size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteStep({ path: { id: step.id! } })}
                >
                  <Trash2 size={14} className="text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Rapport de conversion" />
        <CardBody>
          <FunnelTimeline funnelId={funnelId} />
        </CardBody>
      </Card>

      <FunnelFormModal
        open={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        editing={funnel}
        lockedProductId={productId}
        onSave={handleSaveInfo}
        isSaving={vm.isMutating}
      />
      <FunnelStepModal
        open={stepModalOpen}
        onClose={() => setStepModalOpen(false)}
        productId={productId}
        editing={editingStep}
        onSave={handleSaveStep}
      />
    </div>
  );
}
