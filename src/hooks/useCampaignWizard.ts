import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  getApiCampaignByIdOptions,
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
 * so this collapsed to a single form: general info + cron scheduling. It is now
 * surfaced in a modal (see CampaignFormModal); steps and runs are managed
 * afterwards on the campaign detail page.
 */
export function useCampaignWizard({
  productId,
  campaignId,
  open,
  onClose,
}: {
  productId?: string;
  campaignId?: string;
  open: boolean;
  onClose: () => void;
}) {
  const { draft, updateDraft, resetDraft } = useCampaignDraftStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { createMutationErrorHandler } = useErrorHandling();

  const [loadingInitial, setLoadingInitial] = useState(false);

  // Seed the draft each time the modal opens: an id → edit (fetch), otherwise
  // a fresh create draft scoped to the product (if any).
  useEffect(() => {
    if (!open) return;
    if (campaignId) {
      updateDraft({ id: campaignId });
    } else {
      resetDraft();
      if (productId) updateDraft({ productId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, campaignId, productId]);

  // Load the existing campaign into the draft when editing.
  useEffect(() => {
    async function loadDraft() {
      if (!open || !draft.id) return;
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
  }, [open, draft.id]);

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

  const handleSubmit = async () => {
    if (!draft.name?.trim()) return toast.error("Le nom est requis");
    const finalProductId = draft.productId || productId;
    if (!finalProductId) return toast.error("Veuillez sélectionner un produit");
    if (draft.isRecurring && !draft.cronExpression?.trim())
      return toast.error("Une campagne récurrente requiert une expression cron");

    const isCreate = !draft.id;
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
      // Only jump to the detail page on creation — after an edit the user stays
      // wherever they were (list or detail).
      if (isCreate && campaignId && finalProductId) {
        navigate({
          to: "/$productId/campaigns/$campaignId",
          params: { productId: finalProductId, campaignId },
        });
      }
    } catch {
      /* handled by mutation error handler */
    }
  };

  return {
    draft,
    updateDraft,
    loadingInitial,
    isEditing: !!draft.id,
    handleSubmit,
    isSaving: createMutation.isPending || updateMutation.isPending,
  };
}
