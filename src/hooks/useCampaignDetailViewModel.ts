import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getApiCampaignDetailByIdOptions,
  getApiCampaignDetailByIdQueryKey,
  postApiCampaignScheduleByCampaignIdMutation,
  postApiCampaignUnscheduleByCampaignIdMutation,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import { mapToCampaignModel } from "@/models/campaign.model";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";

/**
 * Master ViewModel for the Campaign Detail page. Scheduling now goes through
 * the cron endpoints (schedule/unschedule); execution through the run engine
 * (see useCampaignRuns). The legacy status-mutation "launch/pause" is gone.
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

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: getApiCampaignDetailByIdQueryKey({ path: { id: campaignId } }),
    });

  const scheduleMutation = useMutation({
    ...postApiCampaignScheduleByCampaignIdMutation(),
    onSuccess: () => {
      invalidate();
      toast.success("Campagne planifiée");
    },
    onError: createMutationErrorHandler({
      toastMessage: "Erreur lors de la planification",
    }),
  });

  const unscheduleMutation = useMutation({
    ...postApiCampaignUnscheduleByCampaignIdMutation(),
    onSuccess: () => {
      invalidate();
      toast.success("Campagne déplanifiée");
    },
    onError: createMutationErrorHandler({
      toastMessage: "Erreur lors de la déplanification",
    }),
  });

  return {
    campaign,
    isLoading: campaignQuery.isLoading,
    activeTab,
    setActiveTab,
    statusVariant: (s: string): "success" | "warning" | "neutral" | "error" => {
      if (s === "running" || s === "active" || s === "completed") return "success";
      if (s === "scheduled" || s === "paused" || s === "waitingtoken") return "warning";
      if (s === "failed") return "error";
      return "neutral";
    },

    // Scheduling
    handleSchedule: useCallback(
      () => scheduleMutation.mutateAsync({ path: { campaignId } }),
      [scheduleMutation, campaignId],
    ),
    handleUnschedule: useCallback(
      () => unscheduleMutation.mutateAsync({ path: { campaignId } }),
      [unscheduleMutation, campaignId],
    ),
    isScheduling: scheduleMutation.isPending || unscheduleMutation.isPending,
    refetch: campaignQuery.refetch,
  };
}
