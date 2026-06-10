import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getApiCampaignDetailByIdOptions,
  putApiCampaignMutation,
  getApiCampaignDetailByIdQueryKey,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import {
  mapToCampaignModel,
  type CampaignModel,
} from "@/models/campaign.model";
import type { UpdateCampaignRequest } from "@/shared/api/generated/types.gen";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";

/**
 * Master ViewModel for the Campaign Detail page.
 * Orchestrates core campaign data and active tab state.
 */
export function useCampaignDetailViewModel(campaignId: string) {
  const queryClient = useQueryClient();
  const { handleRequestError, createMutationErrorHandler } = useErrorHandling();
  const [activeTab, setActiveTab] = useState("overview");

  const campaignQuery = useQuery({
    ...getApiCampaignDetailByIdOptions({ path: { id: campaignId } }),
    select: (res) => (res?.data ? mapToCampaignModel(res.data) : null),
    enabled: !!campaignId,
  });

  useEffect(() => {
    if (campaignQuery.isError && campaignQuery.error) {
      handleRequestError(campaignQuery.error);
    }
  }, [campaignQuery.isError, campaignQuery.error, handleRequestError]);

  const campaign = campaignQuery.data;

  // Global Actions
  const updateStatusMutation = useMutation({
    ...putApiCampaignMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getApiCampaignDetailByIdQueryKey({ path: { id: campaignId } }),
      });
    },
    onError: createMutationErrorHandler(),
  });

  return {
    campaign,
    isLoading: campaignQuery.isLoading,
    activeTab,
    setActiveTab,
    statusVariant: (s: string): "success" | "warning" | "neutral" | "error" => {
      if (s === "active") return "success";
      if (s === "scheduled") return "warning";
      if (s === "completed") return "success";
      if (s === "paused") return "warning";
      return "neutral";
    },

    // Actions
    handleUpdateStatus: (status: CampaignModel["status"]) => {
      const body: UpdateCampaignRequest = { id: campaignId, status };
      updateStatusMutation.mutate({ body });
    },
    // Launch mirrors the wizard finalize: scheduled if a date is set, else active.
    handleLaunch: () => {
      const status: CampaignModel["status"] = campaign?.scheduledAt
        ? "scheduled"
        : "active";
      const body: UpdateCampaignRequest = {
        id: campaignId,
        status,
        scheduledAt: campaign?.scheduledAt ?? undefined,
      };
      updateStatusMutation.mutate({ body });
    },
    isStatusPending: updateStatusMutation.isPending,
    refetch: campaignQuery.refetch,
  };
}
