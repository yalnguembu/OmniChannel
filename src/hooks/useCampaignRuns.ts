import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getApiCampaignRunsByCampaignIdOptions,
  getApiCampaignRunsByCampaignIdQueryKey,
  postApiCampaignRunsByCampaignIdMutation,
  postApiCampaignRunsPauseByRunIdMutation,
  postApiCampaignRunsResumeByRunIdMutation,
  getApiCampaignRunsSummaryByRunIdOptions,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import type {
  CampaignRunSummaryResponse,
  CampaignRunDetailResponse,
} from "@/shared/api/generated/types.gen";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";

/**
 * Campaign execution engine. Runs list/start/pause/resume + run detail.
 * The run endpoints are typed `ObjectOmniChannelApiResponse` in the contract
 * (untyped `data`), so we cast to the `CampaignRun*Response` schemas which the
 * backend actually returns.
 */
export function useCampaignRuns(
  campaignId: string,
  options?: { enabled?: boolean },
) {
  const queryClient = useQueryClient();
  const { handleRequestError } = useErrorHandling();
  const isEnabled = options?.enabled ?? true;

  const runsQuery = useQuery({
    ...getApiCampaignRunsByCampaignIdOptions({ path: { campaignId } }),
    select: (res) =>
      ((res as any)?.data ?? []) as CampaignRunSummaryResponse[],
    enabled: !!campaignId && isEnabled,
  });

  useEffect(() => {
    if (runsQuery.isError && runsQuery.error) handleRequestError(runsQuery.error);
  }, [runsQuery.isError, runsQuery.error, handleRequestError]);

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: getApiCampaignRunsByCampaignIdQueryKey({ path: { campaignId } }),
    });

  const startMutation = useMutation({
    ...postApiCampaignRunsByCampaignIdMutation(),
    onSuccess: () => {
      invalidate();
      toast.success("Exécution démarrée");
    },
    onError: () => toast.error("Erreur lors du démarrage de l'exécution"),
  });

  const pauseMutation = useMutation({
    ...postApiCampaignRunsPauseByRunIdMutation(),
    onSuccess: () => {
      invalidate();
      toast.success("Exécution mise en pause");
    },
    onError: () => toast.error("Erreur lors de la mise en pause"),
  });

  const resumeMutation = useMutation({
    ...postApiCampaignRunsResumeByRunIdMutation(),
    onSuccess: () => {
      invalidate();
      toast.success("Exécution reprise");
    },
    onError: () => toast.error("Erreur lors de la reprise"),
  });

  return {
    runs: runsQuery.data || [],
    isLoading: runsQuery.isLoading,
    refetch: runsQuery.refetch,
    startRun: () => startMutation.mutateAsync({ path: { campaignId } }),
    pauseRun: (runId: string) => pauseMutation.mutateAsync({ path: { runId } }),
    resumeRun: (runId: string) => resumeMutation.mutateAsync({ path: { runId } }),
    isMutating:
      startMutation.isPending ||
      pauseMutation.isPending ||
      resumeMutation.isPending,
  };
}

/** Loads a single run's detail (run summary + per-step execution). */
export function useCampaignRunDetail(runId: string | null) {
  const { handleRequestError } = useErrorHandling();

  const query = useQuery({
    ...getApiCampaignRunsSummaryByRunIdOptions({ path: { runId: runId ?? "" } }),
    select: (res) => (res as any)?.data as CampaignRunDetailResponse | undefined,
    enabled: !!runId,
  });

  useEffect(() => {
    if (query.isError && query.error) handleRequestError(query.error);
  }, [query.isError, query.error, handleRequestError]);

  return { detail: query.data, isLoading: query.isLoading };
}
