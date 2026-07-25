import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getApiCampaignRunsByCampaignIdOptions,
  getApiCampaignRunsByCampaignIdQueryKey,
  postApiCampaignRunsByCampaignIdMutation,
  postApiCampaignRunsPauseByRunIdMutation,
  postApiCampaignRunsResumeByRunIdMutation,
  postApiCampaignRunsCancelByRunIdMutation,
  postApiCampaignRunsByRunIdResendFailedMutation,
  postApiCampaignStepsByStepRunIdResendMutation,
  getApiCampaignRunsSummaryByRunIdOptions,
  getApiCampaignRunsSummaryByRunIdQueryKey,
  getApiCampaignStepsByStepRunIdSendSummaryOptions,
  getApiCampaignStepsByStepRunIdSendSummaryQueryKey,
  getApiCampaignStepsByStepRunIdSendItemsOptions,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import type {
  CampaignRunSummaryResponse,
  CampaignRunDetailResponse,
  CampaignSendSummaryResponse,
  CampaignSendItemResponse,
} from "@/shared/api/generated/types.gen";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";

/**
 * Campaign execution engine. Runs list/start/pause/resume/cancel + run detail +
 * resend of the messages that never went out.
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

  const cancelMutation = useMutation({
    ...postApiCampaignRunsCancelByRunIdMutation(),
    onSuccess: () => {
      invalidate();
      toast.success("Exécution annulée");
    },
    onError: () => toast.error("Erreur lors de l'annulation"),
  });

  // Relaunches every failed / partial step of the run. Idempotent: recipients
  // already SENT are skipped, so a double click can't double-send.
  const resendFailedMutation = useMutation({
    ...postApiCampaignRunsByRunIdResendFailedMutation(),
    onSuccess: (res) => {
      invalidate();
      const relaunched = (res as any)?.data?.relaunched ?? (res as any)?.relaunched;
      toast.success(
        relaunched != null
          ? `Relance de ${relaunched} étape(s)`
          : "Relance des échecs enfilée",
      );
    },
    onError: () => toast.error("Erreur lors de la relance des échecs"),
  });

  return {
    runs: runsQuery.data || [],
    isLoading: runsQuery.isLoading,
    refetch: runsQuery.refetch,
    startRun: () => startMutation.mutateAsync({ path: { campaignId } }),
    pauseRun: (runId: string) => pauseMutation.mutateAsync({ path: { runId } }),
    resumeRun: (runId: string) => resumeMutation.mutateAsync({ path: { runId } }),
    cancelRun: (runId: string) => cancelMutation.mutateAsync({ path: { runId } }),
    resendFailed: (runId: string) =>
      resendFailedMutation.mutateAsync({ path: { runId } }),
    isMutating:
      startMutation.isPending ||
      pauseMutation.isPending ||
      resumeMutation.isPending ||
      cancelMutation.isPending ||
      resendFailedMutation.isPending,
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

  return { detail: query.data, isLoading: query.isLoading, refetch: query.refetch };
}

/**
 * Bulk-send progress of one `SendMessage` step run (Total / Envoyés / Échecs /
 * Ignorés + the bulk header status), plus its resend action.
 *
 * Only meaningful once the step actually created a bulk send — pass
 * `enabled: false` (i.e. no `bulkSendId` on the step run) to skip the call
 * instead of eating a 404.
 */
export function useCampaignStepSendSummary(
  stepRunId: string | null,
  options?: { enabled?: boolean },
) {
  const queryClient = useQueryClient();
  const isEnabled = (options?.enabled ?? true) && !!stepRunId;

  const query = useQuery({
    ...getApiCampaignStepsByStepRunIdSendSummaryOptions({
      path: { stepRunId: stepRunId ?? "" },
    }),
    select: (res) =>
      (res as any)?.data as CampaignSendSummaryResponse | undefined,
    enabled: isEnabled,
    // The step is progressing while the run is live; a short staleTime keeps the
    // numbers moving without hammering the endpoint on every re-render.
    staleTime: 10 * 1000,
  });

  // Reuses the same bulkSendId, so already-SENT recipients are skipped.
  const resendMutation = useMutation({
    ...postApiCampaignStepsByStepRunIdResendMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getApiCampaignStepsByStepRunIdSendSummaryQueryKey({
          path: { stepRunId: stepRunId ?? "" },
        }),
      });
      toast.success("Relance enfilée");
    },
    onError: () => toast.error("Erreur lors de la relance de l'étape"),
  });

  return {
    summary: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    resend: () =>
      stepRunId
        ? resendMutation.mutateAsync({ path: { stepRunId } })
        : Promise.resolve(undefined),
    isResending: resendMutation.isPending,
  };
}

/**
 * Per-recipient diagnostic for a step run — `status` filters the list (e.g.
 * "FAILED" to see only what didn't go out). Deferred: pass `enabled` false
 * until the user expands the panel.
 */
export function useCampaignStepSendItems(
  stepRunId: string | null,
  status?: string,
  options?: { enabled?: boolean },
) {
  const query = useQuery({
    ...getApiCampaignStepsByStepRunIdSendItemsOptions({
      path: { stepRunId: stepRunId ?? "" },
      query: status ? { status } : undefined,
    }),
    select: (res) =>
      ((res as any)?.data ?? []) as CampaignSendItemResponse[],
    enabled: (options?.enabled ?? true) && !!stepRunId,
  });

  return { items: query.data ?? [], isLoading: query.isLoading };
}

/** Invalidates a run's detail — used after a resend so the timeline refreshes. */
export function useInvalidateRunDetail() {
  const queryClient = useQueryClient();
  return (runId: string) =>
    queryClient.invalidateQueries({
      queryKey: getApiCampaignRunsSummaryByRunIdQueryKey({ path: { runId } }),
    });
}
