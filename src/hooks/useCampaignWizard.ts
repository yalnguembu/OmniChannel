import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  getApiCampaignByIdOptions,
  getApiProductDropdownOptions,
  postApiCampaignMutation,
  putApiCampaignMutation,
  postApiCampaignSearchQueryKey,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import { useCampaignDraftStore } from "@/store/campaignDraftStore";
import { mapToCampaignModel } from "@/models/campaign.model";
import type {
  CreateCampaignRequest,
  UpdateCampaignRequest,
} from "@/shared/api/generated/types.gen";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";

/**
 * Campaign create/edit flow. The new contract dropped channels/segments as
 * resources (targeting lives in step configJson, managed on the detail page),
 * so this collapses to a simple 2-step form: general info + cron scheduling.
 * Steps and runs are managed afterwards on the campaign detail page.
 */
export function useCampaignWizard({
  productId,
  onClose,
}: {
  productId?: string;
  onClose: () => void;
}) {
  const { draft, step, setStep, updateDraft, resetDraft } =
    useCampaignDraftStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { createMutationErrorHandler } = useErrorHandling();

  const [loadingInitial, setLoadingInitial] = useState(false);
  const activeProductId = productId || draft.productId;

  // Seed the draft when editing an existing campaign.
  useEffect(() => {
    async function loadDraft() {
      if (!draft.id) {
        if (productId && !draft.productId) updateDraft({ productId });
        return;
      }
      setLoadingInitial(true);
      try {
        const campRes = await queryClient.fetchQuery(
          getApiCampaignByIdOptions({ path: { id: draft.id } }),
        );
        const camp = mapToCampaignModel(campRes.data);
        updateDraft({
          id: camp.id,
          name: camp.name,
          description: camp.description ?? "",
          productId: camp.productId,
          isRecurring: camp.type === "recurring" || camp.isRecurring,
          cronExpression: camp.cronExpression ?? "",
        });
      } catch {
        toast.error("Erreur de synchronisation de la campagne");
      } finally {
        setLoadingInitial(false);
      }
    }
    loadDraft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.id]);

  const { data: dropdownProducts } = useQuery({
    ...getApiProductDropdownOptions(),
    enabled: !productId,
  });

  const createMutation = useMutation({
    ...postApiCampaignMutation(),
    onError: createMutationErrorHandler(),
  });
  const updateMutation = useMutation({
    ...putApiCampaignMutation(),
    onError: createMutationErrorHandler(),
  });

  const buildBody = (): CreateCampaignRequest => {
    const recurring = !!draft.isRecurring;
    return {
      name: (draft.name ?? "").trim(),
      description: draft.description || undefined,
      productId: draft.productId || productId,
      type: recurring ? "Recurring" : "OneTime",
      isRecurring: recurring,
      cronExpression: recurring ? draft.cronExpression || undefined : undefined,
      status: "Draft",
    };
  };

  const handleNext = () => {
    if (step === 0) {
      if (!draft.name?.trim()) return toast.error("Le nom est requis");
      if (!draft.productId && !productId)
        return toast.error("Veuillez sélectionner un produit");
    }
    setStep(step + 1);
  };

  const handleFinish = async () => {
    if (!draft.name?.trim()) return toast.error("Le nom est requis");
    const finalProductId = draft.productId || productId;
    if (!finalProductId) return toast.error("Produit requis");
    if (draft.isRecurring && !draft.cronExpression?.trim())
      return toast.error("Une campagne récurrente requiert une expression cron");

    try {
      const body = buildBody();
      let campaignId = draft.id;
      if (draft.id) {
        const updateBody: UpdateCampaignRequest = { ...body, id: draft.id };
        await updateMutation.mutateAsync({ body: updateBody });
      } else {
        const res = await createMutation.mutateAsync({ body });
        campaignId = res?.data?.id ?? undefined;
      }
      queryClient.invalidateQueries({ queryKey: postApiCampaignSearchQueryKey() });
      toast.success("Campagne enregistrée");
      resetDraft();
      onClose();
      if (campaignId) {
        navigate({
          to: "/campaigns/$campaignId",
          params: { campaignId },
        });
      }
    } catch {
      /* handled by mutation error handler */
    }
  };

  return {
    draft,
    step,
    setStep,
    updateDraft,
    loadingInitial,
    activeProductId,
    dropdownProducts: dropdownProducts?.data || [],
    handleNext,
    handleFinish,
    isSaving: createMutation.isPending || updateMutation.isPending,
  };
}
