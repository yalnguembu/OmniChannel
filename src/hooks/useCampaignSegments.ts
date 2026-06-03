import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  postApiCampaignSegmentSearchOptions,
  getApiClientSegmentDropdownOptions,
  postApiCampaignSegmentMutation,
  deleteApiCampaignSegmentByIdMutation,
  postApiCampaignSegmentSearchQueryKey,
} from "@/shared/api/generated/@tanstack/react-query.gen";

/**
 * Hook for managing campaign's specific segments targeting.
 * Pass `options.enabled = false` to skip fetching until the segments tab is active.
 */
export function useCampaignSegments(
  campaignId: string,
  productId?: string,
  options?: { enabled?: boolean },
) {
  const queryClient = useQueryClient();
  const isEnabled = options?.enabled ?? true;

  const segmentsQuery = useQuery({
    ...postApiCampaignSegmentSearchOptions({
      body: { campaignId, pageSize: 100 },
    }),
    select: (res: any) => res?.data?.items || [],
    enabled: !!campaignId && isEnabled,
  });

  const allSegmentsQuery = useQuery({
    ...getApiClientSegmentDropdownOptions({ query: { productid: productId } }),
    select: (res: any) => res?.data || [],
    enabled: !!productId && isEnabled,
  });

  const addMutation = useMutation({
    ...postApiCampaignSegmentMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: postApiCampaignSegmentSearchQueryKey(),
      });
      toast.success("Segment ajouté");
    },
    onError: () => toast.error("Erreur lors de l’ajout"),
  });

  const removeMutation = useMutation({
    ...deleteApiCampaignSegmentByIdMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: postApiCampaignSegmentSearchQueryKey(),
      });
      toast.success("Segment retiré");
    },
  });

  return {
    campaignSegments: segmentsQuery.data || [],
    allSegments: allSegmentsQuery.data || [],
    isLoading: segmentsQuery.isLoading,

    // Actions
    handleAdd: (segmentId: string) => addMutation.mutate({ body: { campaignId, segmentId } }),
    handleRemove: (id: string) => removeMutation.mutate({ path: { id } }),
    isActionPending: addMutation.isPending || removeMutation.isPending,
  };
}
