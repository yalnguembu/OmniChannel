import { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
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

export type CampaignFilterType =
  | "all"
  | "active"
  | "scheduled"
  | "completed"
  | "draft";

/**
 * ViewModel for the Campaigns List and Creation flow.
 */
export function useCampaignViewModel() {
  const queryClient = useQueryClient();
  const { handleRequestError, createMutationErrorHandler } = useErrorHandling();
  const { updateDraft, resetDraft } = useCampaignDraftStore();
  const navigate = useNavigate();

  // --- List State ---
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<CampaignFilterType>("all");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // --- Queries ---
  const campaignsQuery = useQuery({
    ...postApiCampaignSearchOptions({
      body: {
        pageNumber: page,
        pageSize,
        searchTerm: search || undefined,
        status: filter !== "all" ? filter : undefined,
      },
    }),
    select: (res) => {
      const items = mapToCampaignModels(
        (res?.data?.items as SearchCampaignResponse[]) ||
          (Array.isArray(res?.data) ? res.data : []),
      );
      const totalCount =
        (res?.metadata?.totalCount as number) || (res?.data?.totalCount as number) || items.length;

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

  // --- Derived State (Counting by status for the whole list) ---
  const counts = useMemo(
    () => ({
      all: totalCount,
      active: campaigns.filter((c) => c.status === "active").length,
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
  const handleSearch = useCallback((val: string) => {
    setSearch(val);
    setPage(1);
  }, []);

  const handleFilter = useCallback((val: CampaignFilterType) => {
    setFilter(val);
    setPage(1);
  }, []);

  const handleOpenWizard = useCallback(() => {
    resetDraft();
    navigate({ to: "/campaigns/new" });
  }, [resetDraft, navigate]);

  const handleEditCampaign = useCallback(
    (id: string) => {
      navigate({
        to: "/campaigns/$campaignId/edit",
        params: { campaignId: id },
      });
    },
    [navigate],
  );

  const handleCloseWizard = useCallback(() => {
    resetDraft();
    navigate({ to: "/campaigns" });
  }, [resetDraft, navigate]);

  return {
    // State
    campaigns,
    totalCount,
    counts,
    isLoading: campaignsQuery.isLoading,
    isActionPending: deleteMutation.isPending || duplicateMutation.isPending,
    search,
    filter,
    page,
    pageSize,

    // UI State (None, handled by routing)

    // Handlers
    handleSearch,
    handleFilter,
    setPage,
    handleOpenWizard,
    handleEditCampaign,
    handleCloseWizard,
    handleDelete: (id: string) => deleteMutation.mutate({ path: { id } }),
    handleDuplicate: (c: CampaignModel) => {
      const body: CreateCampaignRequest = {
        name: `${c.name} (copie)`,
        status: "draft",
        type: c.type,
        productId: c.productId,
        description: c.description || undefined,
      };
      duplicateMutation.mutate({ body });
    },
  };
}
