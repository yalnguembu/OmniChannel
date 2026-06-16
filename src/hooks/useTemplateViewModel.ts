import { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  postApiTemplateSearchOptions,
  getApiChannelDropdownOptions,
  postApiTemplateChannelSearchOptions,
  postApiTemplateMutation,
  putApiTemplateMutation,
  deleteApiTemplateByIdMutation,
  postApiTemplateChannelMutation,
  deleteApiTemplateChannelByIdMutation,
  postApiTemplateSearchQueryKey,
  postApiTemplateChannelSearchQueryKey,
  getApiProductDropdownOptions,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import {
  mapToTemplateModels,
  type TemplateModel,
} from "@/models/template.model";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";
import type {
  SearchTemplateResponse,
  SearchTemplateChannelResponse,
  CreateTemplateRequest,
  UpdateTemplateRequest,
} from "@/shared/api/generated/types.gen";
import { useListFilters } from "@/hooks/useListFilters";
import type { FilterFieldConfig } from "@/components/features/shared/ListFilterBar";

const ADVANCED_DEFAULTS = {
  name: "",
  category: "",
  ids: "",
  sortBy: "createdAt",
  sortDirection: "desc",
  pageSize: "30",
};

/** Advanced (modal) filter fields for templates — SearchTemplateRequest. */
export const TEMPLATE_FILTER_FIELDS: FilterFieldConfig[] = [
  { key: "name", label: "Nom", type: "text", placeholder: "Nom du template" },
  {
    key: "category",
    label: "Catégorie",
    type: "text",
    placeholder: "transactionnel, marketing…",
  },
  {
    key: "ids",
    label: "IDs de templates",
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
      { value: "30", label: "30" },
      { value: "50", label: "50" },
      { value: "100", label: "100" },
    ],
  },
];

/**
 * ViewModel Hook for the Templates Page.
 * Encapsulates all business logic, data fetching, and state management.
 */
export function useTemplateViewModel(productId?: string) {
  const queryClient = useQueryClient();
  const { handleRequestError, createMutationErrorHandler } = useErrorHandling();

  const filters = useListFilters(ADVANCED_DEFAULTS);

  // --- Local State ---
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TemplateModel | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<TemplateModel | null>(null);

  // --- Data Fetching (Queries) ---

  // 1. Templates List
  const templatesQuery = useQuery({
    ...postApiTemplateSearchOptions({
      body: {
        ...filters.commonBody(),
        name: filters.advanced.name?.trim() || undefined,
        category: filters.advanced.category?.trim() || undefined,
        // Scope to a product when rendered inside a product page.
        productId: productId || undefined,
      } as any,
    }),
    select: (res) => ({
      items: mapToTemplateModels(
        (res?.data?.items as SearchTemplateResponse[]) || [],
      ),
      totalCount: res?.data?.totalCount || 0,
    }),
    placeholderData: (prev) => prev,
  });

  useEffect(() => {
    if (templatesQuery.isError && templatesQuery.error) {
      handleRequestError(templatesQuery.error);
    }
  }, [templatesQuery.isError, templatesQuery.error, handleRequestError]);

  // 2. Channels Dropdown
  const channelsQuery = useQuery({
    ...getApiChannelDropdownOptions(),
    select: (res) => res?.data || [],
  });

  const productsQuery = useQuery({
    ...getApiProductDropdownOptions(),
    select: (res) => res?.data || [],
  });

  // 3. Active Template Detail (Safe selection)
  const activeTemplate = useMemo(() => {
    return (
      templatesQuery.data?.items.find((t) => t.id === activeTemplateId) || null
    );
  }, [templatesQuery.data?.items, activeTemplateId]);

  // 4. Linked Channels for Active Template
  const templateChannelsQuery = useQuery({
    ...postApiTemplateChannelSearchOptions({
      body: {
        templateId: activeTemplateId || "",
        pageNumber: 1,
        pageSize: 50,
      },
    }),
    select: (res) =>
      (res?.data?.items as SearchTemplateChannelResponse[]) || [],
    enabled: !!activeTemplateId,
  });

  // --- Mutations ---

  const createMutation = useMutation({
    ...postApiTemplateMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: postApiTemplateSearchQueryKey(),
      });
      setIsModalOpen(false);
      toast.success("Template créé avec succès");
    },
    onError: createMutationErrorHandler(),
  });

  const updateMutation = useMutation({
    ...putApiTemplateMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: postApiTemplateSearchQueryKey(),
      });
      setIsModalOpen(false);
      setEditingTemplate(null);
      toast.success("Template mis à jour");
    },
    onError: createMutationErrorHandler(),
  });

  const deleteMutation = useMutation({
    ...deleteApiTemplateByIdMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: postApiTemplateSearchQueryKey(),
      });
      setDeleteTarget(null);
      if (activeTemplateId === deleteTarget?.id) setActiveTemplateId(null);
      toast.success("Template supprimé");
    },
    onError: createMutationErrorHandler(),
  });

  const linkChannelMutation = useMutation({
    ...postApiTemplateChannelMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: postApiTemplateChannelSearchQueryKey(),
      });
      toast.success("Canal mis à jour");
    },
    onError: createMutationErrorHandler({
      toastMessage: "Erreur lors de la mise à jour",
    }),
  });

  const unlinkChannelMutation = useMutation({
    ...deleteApiTemplateChannelByIdMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: postApiTemplateChannelSearchQueryKey(),
      });
      toast.success("Canal mis à jour");
    },
    onError: createMutationErrorHandler({
      toastMessage: "Erreur lors de la mise à jour",
    }),
  });

  // --- Memoized Handlers ---

  const handleSelectTemplate = useCallback((template: TemplateModel) => {
    setActiveTemplateId(template.id);
  }, []);

  const handleOpenCreateModal = useCallback(() => {
    setEditingTemplate(null);
    setIsModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((template: TemplateModel) => {
    setEditingTemplate(template);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingTemplate(null);
  }, []);

  const handleConfirmDelete = useCallback((template: TemplateModel) => {
    setDeleteTarget(template);
  }, []);

  const handleCancelDelete = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  const handleToggleChannel = useCallback(
    async (channelId: string, isLinked: boolean) => {
      if (!activeTemplateId) return;

      if (isLinked) {
        const tc = templateChannelsQuery.data?.find(
          (x) => x.channelId === channelId,
        );
        if (tc && tc.id) {
          unlinkChannelMutation.mutate({ path: { id: tc.id } });
        }
      } else {
        linkChannelMutation.mutate({
          body: {
            templateId: activeTemplateId,
            channelId,
          },
        });
      }
    },
    [
      activeTemplateId,
      templateChannelsQuery.data,
      unlinkChannelMutation,
      linkChannelMutation,
    ],
  );

  const handleDuplicate = useCallback(
    async (template: TemplateModel) => {
      // subject/content/version live on the TemplateChannel variant —
      // use PUT /api/TemplateChannel/variant to edit per-channel content after creation.
      const body: CreateTemplateRequest = {
        productId: template.productId,
        name: `${template.name} (copie)`,
        description: template.description ?? undefined,
        status: "draft",
        category: template.category ?? undefined,
        defaultLanguage: template.language ?? undefined,
      };
      createMutation.mutate({ body });
    },
    [createMutation],
  );

  const handleInlineSave = useCallback(
    (template: TemplateModel, data: Partial<TemplateModel>) => {
      // Explicit pick of UpdateTemplateRequest fields only.
      // subject/content live on the TemplateChannel variant, not on the template.
      const body: UpdateTemplateRequest = {
        id: template.id,
        productId: template.productId,
        name: data.name ?? template.name,
        description: data.description ?? template.description,
        status: data.status ?? template.status,
        category: data.category ?? template.category,
        defaultLanguage: data.language ?? template.language,
        version: data.version ?? template.version,
      };
      updateMutation.mutate({ body });
    },
    [updateMutation],
  );

  const handleSubmit = useCallback(
    (data: TemplateModel) => {
      if (editingTemplate) {
        // Explicit pick of UpdateTemplateRequest fields only.
        // subject/content live on the TemplateChannel variant, not the template.
        const body: UpdateTemplateRequest = {
          id: editingTemplate.id,
          productId: data.productId ?? editingTemplate.productId,
          name: data.name ?? editingTemplate.name,
          description: data.description ?? editingTemplate.description,
          status: data.status ?? editingTemplate.status,
          category: data.category ?? editingTemplate.category,
          defaultLanguage: data.language ?? editingTemplate.language,
          version: data.version ?? editingTemplate.version,
        };
        updateMutation.mutate({ body });
      } else {
        // CreateTemplateRequest — form data doesn't include id; map Model fields explicitly.
        const body: CreateTemplateRequest = {
          productId: data.productId,
          name: data.name,
          description: data.description ?? undefined,
          status: data.status,
          category: data.category ?? undefined,
          defaultLanguage: data.language,
          version: data.version,
        };
        createMutation.mutate({ body });
      }
    },
    [editingTemplate, updateMutation, createMutation],
  );

  // --- Final Return ---
  return {
    // State
    templates: templatesQuery.data?.items || [],
    totalCount: templatesQuery.data?.totalCount || 0,
    activeTemplate,
    templateChannels: templateChannelsQuery.data || [],
    channels: (channelsQuery.data as any) || [],
    products: (productsQuery.data as any) || [],
    isLoading: templatesQuery.isLoading,
    isActionLoading:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,

    // Filters (shared bar)
    filters,
    filterFields: TEMPLATE_FILTER_FIELDS,

    // Modal/UI state
    isModalOpen,
    editingTemplate,
    deleteTarget,

    // Handlers
    handleSelectTemplate,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleCloseModal,
    handleConfirmDelete,
    handleCancelDelete,
    handleToggleChannel,
    handleDuplicate,
    handleInlineSave,
    handleSubmit,
    handleDelete: () =>
      deleteTarget && deleteMutation.mutate({ path: { id: deleteTarget.id } }),
    isUpdateLoading: updateMutation.isPending,
  };
}
