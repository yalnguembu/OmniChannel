import { useCallback, useMemo, useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  postApiCampaignSearchOptions,
  deleteApiCampaignByIdMutation,
  postApiCampaignMutation,
  postApiCampaignSearchQueryKey,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import {
  mapToCampaignModels,
  type CampaignModel,
} from "@/models/campaign.model";
import type {
  SearchCampaignResponse,
  CreateCampaignRequest,
} from "@/shared/api/generated/types.gen";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";
import { useCampaignDraftStore } from "@/store/campaignDraftStore";
import { useListFilters } from "@/hooks/useListFilters";
import type { FilterFieldConfig } from "@/components/features/shared/ListFilterBar";

export type CampaignFilterType =
  | "all"
  | "active"
  | "scheduled"
  | "completed"
  | "draft";

const ADVANCED_DEFAULTS = {
  name: "",
  type: "",
  ids: "",
  sortBy: "createdAt",
  sortDirection: "desc",
  pageSize: "12",
};

/** Advanced (modal) filter fields for campaigns — SearchCampaignRequest. */
export const CAMPAIGN_FILTER_FIELDS: FilterFieldConfig[] = [
  { key: "name", label: "Nom", type: "text", placeholder: "Nom de la campagne" },
  { key: "type", label: "Type", type: "text", placeholder: "sms, email, whatsapp…" },
  {
    key: "ids",
    label: "IDs de campagnes",
    type: "text",
    placeholder: "id1, id2…",
    help: "Séparés par des virgules.",
    fullWidth: true,
  },
  {
    key: "sortBy",
    label: "Trier par",
    type: "select",
    options: [
      { value: "createdAt", label: "Date de création" },
      { value: "name", label: "Nom" },
      { value: "status", label: "Statut" },
    ],
  },
  {
    key: "sortDirection",
    label: "Ordre",
    type: "select",
    options: [
      { value: "desc", label: "Décroissant" },
      { value: "asc", label: "Croissant" },
    ],
  },
  {
    key: "pageSize",
    label: "Par page",
    type: "select",
    options: [
      { value: "12", label: "12" },
      { value: "24", label: "24" },
      { value: "48", label: "48" },
    ],
  },
];

/**
 * ViewModel for the Campaigns List and Creation flow.
 */
export function useCampaignViewModel(productId?: string) {
  const queryClient = useQueryClient();
  const { handleRequestError, createMutationErrorHandler } = useErrorHandling();
  const { resetDraft } = useCampaignDraftStore();

  const filters = useListFilters(ADVANCED_DEFAULTS);

  // Create/edit modal state (replaces the old full-page wizard routes).
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>(undefined);

  // --- Queries ---
  const campaignsQuery = useQuery({
    ...postApiCampaignSearchOptions({
      body: {
        ...filters.commonBody(),
        name: filters.advanced.name?.trim() || undefined,
        type: filters.advanced.type?.trim() || undefined,
        productId: productId || undefined,
      } as any,
    }),
    select: (res) => {
      const items = mapToCampaignModels(
        (res?.data?.items as SearchCampaignResponse[]) ||
          (Array.isArray(res?.data) ? res.data : []),
      );
      const totalCount =
        (res?.metadata?.totalCount as number) ||
        (res?.data?.totalCount as number) ||
        items.length;

      return { items, totalCount };
    },
  });

  useEffect(() => {
    if (campaignsQuery.isError && campaignsQuery.error) {
      handleRequestError(campaignsQuery.error);
    }
  }, [campaignsQuery.isError, campaignsQuery.error, handleRequestError]);

  const campaigns = campaignsQuery.data?.items || [];
  const totalCount = campaignsQuery.data?.totalCount || 0;

  const counts = useMemo(
    () => ({
      all: totalCount,
      running: campaigns.filter((c) => c.status === "running" || c.status === "active").length,
      scheduled: campaigns.filter((c) => c.status === "scheduled").length,
      completed: campaigns.filter((c) => c.status === "completed").length,
      draft: campaigns.filter((c) => c.status === "draft").length,
    }),
    [campaigns, totalCount],
  );

  // --- Mutations ---
  const deleteMutation = useMutation({
    ...deleteApiCampaignByIdMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postApiCampaignSearchQueryKey() });
      toast.success("Campagne supprimée");
    },
    onError: createMutationErrorHandler(),
  });

  const duplicateMutation = useMutation({
    ...postApiCampaignMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postApiCampaignSearchQueryKey() });
      toast.success("Campagne dupliquée");
    },
    onError: createMutationErrorHandler(),
  });

  // --- Handlers ---
  const handleOpenWizard = useCallback(() => {
    resetDraft();
    setEditingId(undefined);
    setFormOpen(true);
  }, [resetDraft]);

  const handleEditCampaign = useCallback((id: string) => {
    setEditingId(id);
    setFormOpen(true);
  }, []);

  const handleCloseWizard = useCallback(() => {
    setFormOpen(false);
    setEditingId(undefined);
    resetDraft();
  }, [resetDraft]);

  return {
    // State
    campaigns,
    totalCount,
    counts,
    isLoading: campaignsQuery.isLoading,
    isActionPending: deleteMutation.isPending || duplicateMutation.isPending,

    // Filters (shared bar)
    filters,
    filterFields: CAMPAIGN_FILTER_FIELDS,

    // Create/edit modal
    formOpen,
    editingId,

    // Handlers
    handleOpenWizard,
    handleEditCampaign,
    handleCloseWizard,
    handleDelete: (id: string) => deleteMutation.mutate({ path: { id } }),
    handleDuplicate: (c: CampaignModel) => {
      const body: CreateCampaignRequest = {
        name: `${c.name} (copie)`,
        status: "Draft",
        type: c.type === "recurring" ? "Recurring" : "OneTime",
        isRecurring: c.type === "recurring",
        cronExpression: c.cronExpression || undefined,
        productId: c.productId,
        description: c.description || undefined,
      };
      duplicateMutation.mutate({ body });
    },
  };
}
