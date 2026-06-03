import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  postApiCampaignStepSearchOptions,
  postApiCampaignStepMutation,
  putApiCampaignStepMutation,
  deleteApiCampaignStepByIdMutation,
  postApiCampaignStepSearchQueryKey,
} from "@/shared/api/generated/@tanstack/react-query.gen";

/**
 * Hook for managing campaign's specific steps (automation sequence).
 * Pass `options.enabled = false` to skip fetching until the steps tab is active.
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
    select: (res) => res?.data?.items || [],
    enabled: !!campaignId && isEnabled,
  });

  const addMutation = useMutation({
    ...postApiCampaignStepMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: postApiCampaignStepSearchQueryKey(),
      });
      toast.success("Étape ajoutée");
    },
    onError: () => toast.error("Erreur lors de l’ajout"),
  });

  const updateMutation = useMutation({
    ...putApiCampaignStepMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: postApiCampaignStepSearchQueryKey(),
      });
      toast.success("Étape mise à jour");
    },
  });

  const deleteMutation = useMutation({
    ...deleteApiCampaignStepByIdMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: postApiCampaignStepSearchQueryKey(),
      });
      toast.success("Étape supprimée");
    },
  });

  return {
    campaignSteps: stepsQuery.data || [],
    isLoading: stepsQuery.isLoading,

    // Actions
    handleAdd: (body: any) => addMutation.mutate({ body: { campaignId, ...body } }),
    handleUpdate: (body: any) => updateMutation.mutate({ body: { ...body, campaignId } }),
    handleDelete: (id: string) => deleteMutation.mutate({ path: { id } }),
    isActionPending:
      addMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
  };
}
