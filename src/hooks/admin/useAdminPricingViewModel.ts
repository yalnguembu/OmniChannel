import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  postApiSubscriptionPlanSearchOptions,
  postApiSubscriptionPlanSearchQueryKey,
  postApiSubscriptionPlanMutation,
  putApiSubscriptionPlanMutation,
  deleteApiSubscriptionPlanByIdMutation,
  postApiPricingSearchOptions,
  postApiPricingSearchQueryKey,
  postApiPricingMutation,
  putApiPricingMutation,
  deleteApiPricingByIdMutation,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import type {
  CreatePricingRequest,
  UpdatePricingRequest,
  SearchPricingResponse,
  CreateSubscriptionPlanRequest,
  UpdateSubscriptionPlanRequest,
  SearchSubscriptionPlanResponse,
} from "@/shared/api/generated/types.gen";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";

const PLANS_PAGE_SIZE = 50;
const PRICING_PAGE_SIZE = 20;

export type PricingTab = "plans" | "pricing";
export type PricingView = "card" | "table";

/**
 * ViewModel for the admin Pricing page (subscription plans + pricing grid).
 * Uses the generated TanStack Query helpers (react-query.gen) directly and
 * exposes a flat surface (data + handlers) consumed by a dumb page component.
 */
export function useAdminPricingViewModel() {
  const queryClient = useQueryClient();
  const { handleRequestError, createMutationErrorHandler } = useErrorHandling();

  const [activeTab, setActiveTab] = useState<PricingTab>("plans");
  const [plansView, setPlansView] = useState<PricingView>("card");
  const [pricingView, setPricingView] = useState<PricingView>("card");
  const [page, setPage] = useState(1);

  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] =
    useState<SearchSubscriptionPlanResponse | null>(null);
  const [editingPricing, setEditingPricing] =
    useState<SearchPricingResponse | null>(null);

  // ── Plans query ────────────────────────────────────────────────────────────
  const plansQuery = useQuery({
    ...postApiSubscriptionPlanSearchOptions({
      body: {
        pageNumber: 1,
        pageSize: PLANS_PAGE_SIZE,
      },
    }),
    select: (res) => ({
      items: (res?.data?.items ?? []) as SearchSubscriptionPlanResponse[],
      total: res?.data?.totalCount ?? 0,
    }),
    enabled: activeTab === "plans",
  });

  useEffect(() => {
    if (plansQuery.isError && plansQuery.error)
      handleRequestError(plansQuery.error);
  }, [plansQuery.isError, plansQuery.error, handleRequestError]);

  // ── Pricing query ────────────────────────────────────────────────────────────
  const pricingQuery = useQuery({
    ...postApiPricingSearchOptions({
      body: {
        pageNumber: page,
        pageSize: PRICING_PAGE_SIZE,
      },
    }),
    select: (res) => ({
      items: (res?.data?.items ?? []) as SearchPricingResponse[],
      total: res?.data?.totalCount ?? 0,
    }),
    enabled: activeTab === "pricing",
  });

  useEffect(() => {
    if (pricingQuery.isError && pricingQuery.error)
      handleRequestError(pricingQuery.error);
  }, [pricingQuery.isError, pricingQuery.error, handleRequestError]);

  const plans = plansQuery.data?.items ?? [];
  const plansTotal = plansQuery.data?.total ?? 0;
  const pricings = pricingQuery.data?.items ?? [];
  const pricingTotal = pricingQuery.data?.total ?? 0;

  const invalidatePlans = useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: postApiSubscriptionPlanSearchQueryKey(),
      }),
    [queryClient],
  );

  const invalidatePricing = useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: postApiPricingSearchQueryKey(),
      }),
    [queryClient],
  );

  // ── Modal handlers ───────────────────────────────────────────────────────────
  const handleClosePlanModal = useCallback(() => {
    setIsPlanModalOpen(false);
    setEditingPlan(null);
  }, []);

  const handleClosePricingModal = useCallback(() => {
    setIsPricingModalOpen(false);
    setEditingPricing(null);
  }, []);

  // ── Plan mutations ───────────────────────────────────────────────────────────
  const createPlanMutation = useMutation({
    ...postApiSubscriptionPlanMutation(),
    onSuccess: () => {
      invalidatePlans();
      handleClosePlanModal();
      toast.success("Plan créé");
    },
    onError: createMutationErrorHandler(),
  });

  const updatePlanMutation = useMutation({
    ...putApiSubscriptionPlanMutation(),
    onSuccess: () => {
      invalidatePlans();
      handleClosePlanModal();
      toast.success("Plan modifié");
    },
    onError: createMutationErrorHandler(),
  });

  // ── Pricing mutations ────────────────────────────────────────────────────────
  const createPricingMutation = useMutation({
    ...postApiPricingMutation(),
    onSuccess: () => {
      invalidatePricing();
      handleClosePricingModal();
      toast.success("Tarif créé");
    },
    onError: createMutationErrorHandler(),
  });

  const updatePricingMutation = useMutation({
    ...putApiPricingMutation(),
    onSuccess: () => {
      invalidatePricing();
      handleClosePricingModal();
      toast.success("Tarif modifié");
    },
    onError: createMutationErrorHandler(),
  });

  const deletePricingMutation = useMutation({
    ...deleteApiPricingByIdMutation(),
    onSuccess: () => {
      invalidatePricing();
      toast.success("Supprimé");
    },
    onError: createMutationErrorHandler(),
  });

  // ── Plan open/submit ─────────────────────────────────────────────────────────
  const handleOpenCreatePlan = useCallback(() => {
    setEditingPlan(null);
    setIsPlanModalOpen(true);
  }, []);

  const handleOpenEditPlan = useCallback(
    (plan: SearchSubscriptionPlanResponse) => {
      setEditingPlan(plan);
      setIsPlanModalOpen(true);
    },
    [],
  );

  const handleSubmitPlan = useCallback(
    (data: CreateSubscriptionPlanRequest) => {
      if (editingPlan) {
        const body: UpdateSubscriptionPlanRequest = {
          ...data,
          id: editingPlan.id,
        };
        updatePlanMutation.mutate({ body });
      } else {
        createPlanMutation.mutate({ body: data });
      }
    },
    [editingPlan, updatePlanMutation, createPlanMutation],
  );

  // ── Pricing open/submit ──────────────────────────────────────────────────────
  const handleOpenCreatePricing = useCallback(() => {
    setEditingPricing(null);
    setIsPricingModalOpen(true);
  }, []);

  const handleOpenEditPricing = useCallback((pricing: SearchPricingResponse) => {
    setEditingPricing(pricing);
    setIsPricingModalOpen(true);
  }, []);

  const handleSubmitPricing = useCallback(
    (data: CreatePricingRequest) => {
      if (editingPricing) {
        const body: UpdatePricingRequest = { ...data, id: editingPricing.id };
        updatePricingMutation.mutate({ body });
      } else {
        createPricingMutation.mutate({ body: data });
      }
    },
    [editingPricing, updatePricingMutation, createPricingMutation],
  );

  const handleDeletePricing = useCallback(
    (id: string) => {
      deletePricingMutation.mutate({ path: { id } });
    },
    [deletePricingMutation],
  );

  const handleChangeTab = useCallback((tab: PricingTab) => {
    setActiveTab(tab);
    setPage(1);
  }, []);

  return {
    // tabs / views
    activeTab,
    setActiveTab: handleChangeTab,
    plansView,
    setPlansView,
    pricingView,
    setPricingView,

    // plans data
    plans,
    plansTotal,
    isLoadingPlans: plansQuery.isLoading,

    // pricing data
    pricings,
    pricingTotal,
    isLoadingPricing: pricingQuery.isLoading,
    page,
    setPage,
    pricingPageSize: PRICING_PAGE_SIZE,

    // plan modal
    isPlanModalOpen,
    editingPlan,
    isPlanActionPending:
      createPlanMutation.isPending || updatePlanMutation.isPending,
    handleOpenCreatePlan,
    handleOpenEditPlan,
    handleClosePlanModal,
    handleSubmitPlan,

    // pricing modal
    isPricingModalOpen,
    editingPricing,
    isPricingActionPending:
      createPricingMutation.isPending || updatePricingMutation.isPending,
    handleOpenCreatePricing,
    handleOpenEditPricing,
    handleClosePricingModal,
    handleSubmitPricing,
    handleDeletePricing,
  };
}
