import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  postApiCampaignChannelSearchOptions,
  getApiChannelDropdownOptions,
  postApiTemplateSearchOptions,
  postApiCampaignChannelMutation,
  deleteApiCampaignChannelByIdMutation,
  putApiCampaignChannelMutation,
  postApiCampaignChannelSearchQueryKey,
} from "@/shared/api/generated/@tanstack/react-query.gen";

/**
 * Hook for managing campaign's specific channels and template links.
 */
export function useCampaignChannels(campaignId: string, productId?: string) {
  const queryClient = useQueryClient();

  const channelsQuery = useQuery({
    ...postApiCampaignChannelSearchOptions({
      body: { campaignId, pageSize: 100 },
    }),
    select: (res: any) => res?.data?.items || [],
    enabled: !!campaignId,
  });

  const allChannelsQuery = useQuery({
    ...getApiChannelDropdownOptions(),
    select: (res: any) => res?.data || [],
  });

  const templatesQuery = useQuery({
    ...postApiTemplateSearchOptions({
      body: { productId, pageSize: 100 },
    }),
    select: (res: any) => res?.data?.items || [],
    enabled: !!productId,
  });

  const addMutation = useMutation({
    ...postApiCampaignChannelMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: postApiCampaignChannelSearchQueryKey(),
      });
      toast.success("Canal ajouté");
    },
    onError: () => toast.error("Erreur lors de l’ajout"),
  });

  const removeMutation = useMutation({
    ...deleteApiCampaignChannelByIdMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: postApiCampaignChannelSearchQueryKey(),
      });
      toast.success("Canal retiré");
    },
  });

  const updateMutation = useMutation({
    ...putApiCampaignChannelMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: postApiCampaignChannelSearchQueryKey(),
      });
      toast.success("Lien mis à jour");
    },
  });

  return {
    campaignChannels: channelsQuery.data || [],
    allChannels: allChannelsQuery.data || [],
    templates: templatesQuery.data || [],
    isLoading: channelsQuery.isLoading,

    // Actions
    handleAdd: (body: any) => addMutation.mutate({ body: { campaignId, ...body } }),
    handleRemove: (id: string) => removeMutation.mutate({ path: { id } }),
    handleUpdate: (body: any) => updateMutation.mutate({ body }),
    isActionPending:
      addMutation.isPending ||
      removeMutation.isPending ||
      updateMutation.isPending,
  };
}
