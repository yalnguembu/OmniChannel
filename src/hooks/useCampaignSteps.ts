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
import {
  parseDependsOn,
  DEFAULT_RUN_CONDITION,
} from "@/components/features/campaigns/stepConfig";

/** A step's persisted fields re-expressed as an update payload — so a partial
 * edit (e.g. only `stepOrder` when reordering) doesn't blank the rest. Note
 * `dependsOnJson` (read) → `dependsOn` (write), keeping `null` = "auto". */
function toUpdateBody(
  step: SearchCampaignStepResponse,
): UpdateCampaignStepRequest {
  return {
    id: step.id,
    campaignId: step.campaignId,
    stepOrder: step.stepOrder,
    dependsOn: parseDependsOn(step.dependsOnJson),
    runCondition: step.runCondition ?? DEFAULT_RUN_CONDITION,
    continueOnError: !!step.continueOnError,
    name: step.name,
    stepType: step.stepType,
    configJson: step.configJson,
    startMode: step.startMode,
    delayMinutes: step.delayMinutes,
    scheduledTime: step.scheduledTime,
    eventCode: step.eventCode,
  };
}

/**
 * Manages a campaign's typed workflow steps (stepType + configJson + startMode),
 * which form a DAG: each step carries `dependsOn` / `runCondition` /
 * `continueOnError`, and every step is persisted independently the moment its
 * modal is validated — so dependencies can reference real server ids.
 * The channel/template/segment associations live inside each step's
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

  // Reordering issues two PUTs at once; a dedicated silent mutation keeps it
  // from firing the "Étape mise à jour" toast twice per arrow click.
  const reorderMutation = useMutation({
    ...putApiCampaignStepMutation(),
    onError: () => toast.error("Erreur lors du réordonnancement"),
  });

  const deleteMutation = useMutation({
    ...deleteApiCampaignStepByIdMutation(),
    onSuccess: () => {
      invalidate();
      toast.success("Étape supprimée");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const steps = stepsQuery.data || [];

  /**
   * Moves a step one slot up/down by swapping `stepOrder` with its neighbour —
   * two independent PUTs, as the contract has no reorder endpoint. Order is
   * presentational only here: dependencies (not order) drive execution, but the
   * "auto" dependency mode resolves to the previous step by order, so a swap can
   * legitimately change the graph.
   */
  const handleReorder = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (index < 0 || target < 0 || target >= steps.length) return;
    const a = steps[index];
    const b = steps[target];
    if (!a?.id || !b?.id) return;
    // Sequential, not parallel: the two writes touch the same campaign's
    // ordering, and the reference editor sequences them too — a concurrent pair
    // risks tripping a transient stepOrder conflict server-side.
    await reorderMutation.mutateAsync({
      body: { ...toUpdateBody(a), campaignId, stepOrder: b.stepOrder },
    });
    await reorderMutation.mutateAsync({
      body: { ...toUpdateBody(b), campaignId, stepOrder: a.stepOrder },
    });
    invalidate();
  };

  return {
    campaignSteps: steps,
    isLoading: stepsQuery.isLoading,

    handleAdd: (body: Omit<CreateCampaignStepRequest, "campaignId">) =>
      addMutation.mutateAsync({ body: { campaignId, ...body } }),
    handleUpdate: (body: Omit<UpdateCampaignStepRequest, "campaignId">) =>
      updateMutation.mutateAsync({ body: { ...body, campaignId } }),
    handleDelete: (id: string) => deleteMutation.mutate({ path: { id } }),
    handleReorder,
    isActionPending:
      addMutation.isPending ||
      updateMutation.isPending ||
      reorderMutation.isPending ||
      deleteMutation.isPending,
  };
}
