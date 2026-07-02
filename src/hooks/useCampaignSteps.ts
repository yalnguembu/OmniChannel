import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  postApiCampaignStepSearchOptions,
  postApiCampaignStepMutation,
  putApiCampaignStepMutation,
  deleteApiCampaignStepByIdMutation,
  postApiCampaignStepSearchQueryKey,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import type {
  SearchCampaignStepResponse,
  CreateCampaignStepRequest,
  UpdateCampaignStepRequest,
} from "@/shared/api/generated/types.gen";

/**
 * Manages a campaign's typed workflow steps (stepType + configJson + startMode).
 * The channel/template/segment associations now live inside each step's
 * configJson — the CampaignChannel/CampaignSegment resources were removed.
 * Pass `options.enabled = false` to defer fetching until the tab is active.
 */
export function useCampaignSteps(
  campaignId: string,
  options?: { enabled?: boolean },
) {
  const queryClient = useQueryClient();
  const isEnabled = options?.enabled ?? true;

  const stepsQuery = useQuery({
    ...postApiCampaignStepSearchOptions({
      body: { campaignId, pageSize: 100 },
    }),
    select: (res) => {
      const items = (res?.data?.items as SearchCampaignStepResponse[]) || [];
      return [...items].sort(
        (a, b) => (a.stepOrder ?? 0) - (b.stepOrder ?? 0),
      );
    },
    enabled: !!campaignId && isEnabled,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: postApiCampaignStepSearchQueryKey(),
    });

  const addMutation = useMutation({
    ...postApiCampaignStepMutation(),
    onSuccess: () => {
      invalidate();
      toast.success("Étape ajoutée");
    },
    onError: () => toast.error("Erreur lors de l'ajout de l'étape"),
  });

  const updateMutation = useMutation({
    ...putApiCampaignStepMutation(),
    onSuccess: () => {
      invalidate();
      toast.success("Étape mise à jour");
    },
    onError: () => toast.error("Erreur lors de la mise à jour de l'étape"),
  });

  const deleteMutation = useMutation({
    ...deleteApiCampaignStepByIdMutation(),
    onSuccess: () => {
      invalidate();
      toast.success("Étape supprimée");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  return {
    campaignSteps: stepsQuery.data || [],
    isLoading: stepsQuery.isLoading,

    handleAdd: (body: Omit<CreateCampaignStepRequest, "campaignId">) =>
      addMutation.mutateAsync({ body: { campaignId, ...body } }),
    handleUpdate: (body: Omit<UpdateCampaignStepRequest, "campaignId">) =>
      updateMutation.mutateAsync({ body: { ...body, campaignId } }),
    handleDelete: (id: string) => deleteMutation.mutate({ path: { id } }),
    isActionPending:
      addMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
  };
}
