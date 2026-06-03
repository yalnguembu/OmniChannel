import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getApiCampaignByIdOptions,
  postApiCampaignChannelSearchOptions,
  postApiCampaignSegmentSearchOptions,
  getApiProductDropdownOptions,
  postApiTemplateSearchOptions,
  getApiClientSegmentDropdownOptions,
  getApiChannelDropdownOptions,
  postApiCampaignMutation,
  putApiCampaignMutation,
  postApiCampaignChannelMutation,
  deleteApiCampaignChannelByIdMutation,
  postApiCampaignSegmentMutation,
  deleteApiCampaignSegmentByIdMutation,
  postApiTemplateMutation,
  postApiCampaignSearchQueryKey,
  getApiProductDropdownQueryKey,
  postApiTemplateSearchQueryKey,
  getApiClientSegmentDropdownQueryKey,
  getApiChannelDropdownQueryKey,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import { useCampaignDraftStore } from "@/store/campaignDraftStore";
import { mapToCampaignModel } from "@/models/campaign.model";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";

export function useCampaignWizard({
  productId,
  onClose,
}: {
  productId?: string;
  onClose: () => void;
}) {
  const { draft, step, setStep, updateDraft, resetDraft } =
    useCampaignDraftStore();
  const queryClient = useQueryClient();
  const { handleRequestError, createMutationErrorHandler } = useErrorHandling();

  const [loadingInitial, setLoadingInitial] = useState(false);
  const [configuringChannelId, setConfiguringChannelId] = useState<
    string | null
  >(null);
  const [showNewTemplateModal, setShowNewTemplateModal] = useState(false);
  const [showSegmentModal, setShowSegmentModal] = useState(false);

  const activeProductId = productId || draft.productId;

  // 1. Initial State Loading (Resume)
  useEffect(() => {
    async function loadDraft() {
      if (!draft.id) {
        if (productId) updateDraft({ productId });
        return;
      }

      setLoadingInitial(true);
      try {
        const [campRes, channelsRes, segmentsRes] = await Promise.all([
          queryClient.fetchQuery(
            getApiCampaignByIdOptions({ path: { id: draft.id } }),
          ),
          queryClient.fetchQuery(
            postApiCampaignChannelSearchOptions({
              body: { campaignId: draft.id, pageSize: 100 },
            }),
          ),
          queryClient.fetchQuery(
            postApiCampaignSegmentSearchOptions({
              body: { campaignId: draft.id, pageSize: 100 },
            }),
          ),
        ]);

        const camp = mapToCampaignModel(campRes.data);
        const channelItems = channelsRes.data?.items ?? [];

        const channelIds = channelItems.map((c: any) => c.channelId);
        const templateIds = channelItems.reduce(
          (acc: any, c: any) => ({ ...acc, [c.channelId]: c.templateId }),
          {},
        );
        const priorities = channelItems.reduce(
          (acc: any, c: any) => ({ ...acc, [c.channelId]: c.priority }),
          {},
        );
        const segmentIds = (segmentsRes.data?.items ?? []).map(
          (s: any) => s.segmentId,
        );

        updateDraft({
          id: camp.id,
          name: camp.name,
          type: camp.type,
          description: camp.description ?? "",
          productId: camp.productId,
          channelIds,
          templateIds,
          priorities,
          segmentIds,
          scheduledAt: camp.scheduledAt ?? undefined,
        });
      } catch (e) {
        toast.error("Erreur de synchronisation");
      } finally {
        setLoadingInitial(false);
      }
    }

    loadDraft();
  }, [draft.id, productId, updateDraft, queryClient]);

  // 2. Core Queries using Generated Options
  const { data: dropdownProducts } = useQuery({
    ...getApiProductDropdownOptions(),
  });

  const { data: templates, isLoading: templatesLoading } = useQuery({
    ...postApiTemplateSearchOptions({
      body: { productId: activeProductId, pageSize: 100 },
    }),
    enabled: !!activeProductId && (step === 1 || step === 3),
  });

  const { data: segments } = useQuery({
    ...getApiClientSegmentDropdownOptions(),
    enabled: !!activeProductId && step === 2,
  });

  const { data: channels } = useQuery({
    ...getApiChannelDropdownOptions(),
    enabled: !!activeProductId,
  });

  // 3. Base Mutations
  const createCampaignMutation = useMutation({
    ...postApiCampaignMutation(),
    onSuccess: (res) => {
      if (res.success && res.data?.id) {
        updateDraft({ id: res.data.id });
        setStep(step + 1);
        queryClient.invalidateQueries({
          queryKey: postApiCampaignSearchQueryKey(),
        });
      } else {
        handleRequestError(res as any);
      }
    },
    onError: createMutationErrorHandler(),
  });

  const updateCampaignMutation = useMutation({
    ...putApiCampaignMutation(),
    onSuccess: (res) => {
      if (res.success) {
        setStep(step + 1);
        queryClient.invalidateQueries({
          queryKey: postApiCampaignSearchQueryKey(),
        });
      } else {
        handleRequestError(res as any);
      }
    },
    onError: createMutationErrorHandler(),
  });

  // 4. Channel Mutations (Syncing)
  const addChannelMutation = useMutation({
    ...postApiCampaignChannelMutation(),
    onSuccess: (_, { body }) => {
      if (body?.channelId) {
        const newIds = [...(draft.channelIds || []), body.channelId];
        updateDraft({ channelIds: newIds });
      }
      setConfiguringChannelId(null);
    },
    onError: createMutationErrorHandler(),
  });

  const removeChannelMutation = useMutation({
    ...deleteApiCampaignChannelByIdMutation(),
    onSuccess: () => {
      // The update of the store state will be handled dynamically in handleSyncChannel
      setConfiguringChannelId(null);
    },
    onError: createMutationErrorHandler(),
  });

  const handleSyncChannel = async ({
    channelId,
    templateId,
    priority,
    action,
  }: {
    channelId: string;
    templateId?: string;
    priority?: number;
    action: "add" | "remove";
  }) => {
    if (!draft.id) return;

    if (action === "remove") {
      try {
        const searchRes = await queryClient.fetchQuery(
          postApiCampaignChannelSearchOptions({
            body: { campaignId: draft.id, channelId, pageSize: 1 },
          }),
        );
        const existingId = searchRes.data?.items?.[0]?.id;
        if (existingId) {
          await removeChannelMutation.mutateAsync({ path: { id: existingId } });
          const newIds = draft.channelIds?.filter((id) => id !== channelId) || [];
          updateDraft({ channelIds: newIds });
        }
      } catch (err) {
        toast.error("Erreur lors du retrait du canal");
      }
    } else {
      addChannelMutation.mutate({
        body: {
          campaignId: draft.id,
          channelId,
          templateId,
          priority: priority ?? 1,
        },
      });
    }
  };

  // 5a. Segment Sync Mutations
  const addSegmentMutation = useMutation({
    ...postApiCampaignSegmentMutation(),
    onError: createMutationErrorHandler({ toastMessage: "Erreur ajout segment" }),
  });

  const removeSegmentMutation = useMutation({
    ...deleteApiCampaignSegmentByIdMutation(),
    onError: createMutationErrorHandler({ toastMessage: "Erreur retrait segment" }),
  });

  /**
   * Synchronise les segments du draft avec l'API :
   * – POST pour chaque segmentId présent dans le draft mais absent en base
   * – DELETE pour chaque enregistrement présent en base mais absent du draft
   */
  const syncSegments = async (campaignId: string) => {
    const wantedIds: string[] = draft.segmentIds ?? [];
    const currentRes = await queryClient.fetchQuery(
      postApiCampaignSegmentSearchOptions({
        body: { campaignId, pageSize: 200 },
      }),
    );
    const currentItems = (currentRes.data?.items ?? []) as Array<{
      id: string;
      segmentId: string;
    }>;
    const currentIds = currentItems.map((s) => s.segmentId);

    const toAdd = wantedIds.filter((id) => !currentIds.includes(id));
    const toRemove = currentItems.filter((s) => !wantedIds.includes(s.segmentId));

    await Promise.all([
      ...toAdd.map((segmentId) =>
        addSegmentMutation.mutateAsync({ body: { campaignId, segmentId } }),
      ),
      ...toRemove.map((s) =>
        removeSegmentMutation.mutateAsync({ path: { id: s.id } }),
      ),
    ]);
  };

  // 5b. Finalize Mutation
  const finalizeMutation = useMutation({
    ...putApiCampaignMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: postApiCampaignSearchQueryKey(),
      });
      toast.success("Campagne lancée avec succès");
      resetDraft();
      onClose();
    },
    onError: createMutationErrorHandler(),
  });

  // 6. Template Mutation
  const createTemplateMutation = useMutation({
    ...postApiTemplateMutation(),
    onSuccess: (res) => {
      if (res.success && res.data?.id && configuringChannelId) {
        updateDraft({
          templateIds: {
            ...(draft.templateIds || {}),
            [configuringChannelId]: res.data.id as string,
          },
        });
        setShowNewTemplateModal(false);
        queryClient.invalidateQueries({
          queryKey: postApiTemplateSearchQueryKey(),
        });
        toast.success("Template créé et sélectionné");
      }
    },
    onError: createMutationErrorHandler(),
  });

  // --- View Handlers ---
  const handleNext = () => {
    if (step === 0) {
      if (!draft.name?.trim()) return toast.error("Le nom est requis");
      const finalProductId = draft.productId || productId;
      if (!finalProductId)
        return toast.error("Veuillez sélectionner un produit");

      const payload = {
        name: draft.name,
        productId: finalProductId,
        type: draft.type || "standard",
        description: draft.description,
        status: "draft",
      };

      if (draft.id) {
        updateCampaignMutation.mutate({ body: { ...payload, id: draft.id } });
      } else {
        createCampaignMutation.mutate({ body: payload });
      }
    } else {
      setStep(step + 1);
    }
  };

  return {
    // State
    draft,
    step,
    setStep,
    updateDraft,
    loadingInitial,
    configuringChannelId,
    setConfiguringChannelId,
    showNewTemplateModal,
    setShowNewTemplateModal,
    showSegmentModal,
    setShowSegmentModal,
    activeProductId,

    // Data
    dropdownProducts: dropdownProducts?.data || [],
    templates: templates?.data?.items || [],
    templatesLoading,
    segments: segments?.data || [],
    channels: channels?.data || [],

    // Mutations & Actions
    persistBaseMutation: {
      isPending: createCampaignMutation.isPending || updateCampaignMutation.isPending,
    },
    syncChannelMutation: {
      mutate: handleSyncChannel,
      isPending: addChannelMutation.isPending || removeChannelMutation.isPending,
    },
    finalizeMutation: {
      mutate: async () => {
        if (!draft.id) return;
        try {
          await syncSegments(draft.id);
        } catch {
          // syncSegments toasts individual errors; we continue to finalize
        }
        finalizeMutation.mutate({
          body: {
            id: draft.id,
            status: draft.scheduledAt ? "scheduled" : "active",
            scheduledAt: draft.scheduledAt,
          },
        });
      },
      isPending:
        finalizeMutation.isPending ||
        addSegmentMutation.isPending ||
        removeSegmentMutation.isPending,
    },
    createTemplateMutation,
    handleNext,
  };
}
