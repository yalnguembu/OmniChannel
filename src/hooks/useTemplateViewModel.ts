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
import type { TemplateDto } from "@/shared/api/generated/types.gen";

/**
 * ViewModel Hook for the Templates Page.
 * Encapsulates all business logic, data fetching, and state management.
 */
export function useTemplateViewModel() {
  const queryClient = useQueryClient();
  const { handleRequestError, createMutationErrorHandler } = useErrorHandling();

  // --- Local State ---
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TemplateModel | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<TemplateModel | null>(null);
  const pageSize = 30;

  // --- Data Fetching (Queries) ---

  // 1. Templates List
  const templatesQuery = useQuery({
    ...postApiTemplateSearchOptions({
      body: {
        pageNumber: page,
        pageSize,
        searchTerm: search || undefined,
      },
    }),
    select: (res) => ({
      items: mapToTemplateModels(res?.data?.items || []),
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
    select: (res) => res?.data?.items || [],
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

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

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
          (x: any) => x.channelId === channelId,
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
      // Explicit pick of CreateTemplateRequest fields only — no id / timestamps / read-only properties
      createMutation.mutate({
        body: {
          productId: template.productId,
          name: `${template.name} (copie)`,
          description: template.description ?? undefined,
          status: "draft",
          subject: (template as any).subject ?? undefined,
          content: (template as any).content ?? undefined,
          language: (template as any).language ?? undefined,
          category: (template as any).category ?? undefined,
          version: (template as any).version ?? undefined,
        },
      });
    },
    [createMutation],
  );

  const handleInlineSave = useCallback(
    (template: TemplateModel, data: Partial<TemplateModel>) => {
      // Explicit pick of UpdateTemplateRequest fields only
      updateMutation.mutate({
        body: {
          id: template.id,
          productId: template.productId,
          name: data.name ?? template.name,
          description: data.description ?? template.description,
          status: data.status ?? template.status,
          subject: (data as any).subject ?? (template as any).subject,
          content: (data as any).content ?? (template as any).content,
          language: (data as any).language ?? (template as any).language,
          category: (data as any).category ?? (template as any).category,
          version: (data as any).version ?? (template as any).version,
        } as any,
      });
    },
    [updateMutation],
  );

  const handleSubmit = useCallback(
    (data: any) => {
      if (editingTemplate) {
        // Explicit pick of UpdateTemplateRequest fields only
        updateMutation.mutate({
          body: {
            id: editingTemplate.id,
            productId: data.productId ?? editingTemplate.productId,
            name: data.name ?? editingTemplate.name,
            description: data.description ?? editingTemplate.description,
            status: data.status ?? editingTemplate.status,
            subject: data.subject ?? (editingTemplate as any).subject,
            content: data.content ?? (editingTemplate as any).content,
            language: data.language ?? (editingTemplate as any).language,
            category: data.category ?? (editingTemplate as any).category,
            version: data.version ?? (editingTemplate as any).version,
          } as any,
        });
      } else {
        // CreateTemplateRequest — data from form doesn't include id; safe to forward
        createMutation.mutate({ body: data });
      }
    },
    [editingTemplate, updateMutation, createMutation],
  );

  // --- Final Return ---
  return {
    // State
    templates: templatesQuery.data?.items || [],
    totalCount: templatesQuery.data?.totalCount || 0,
    search,
    page,
    activeTemplate,
    templateChannels: templateChannelsQuery.data || [],
    channels: (channelsQuery.data as any) || [],
    products: (productsQuery.data as any) || [],
    isLoading: templatesQuery.isLoading,
    isActionLoading:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,

    // Modal/UI state
    isModalOpen,
    editingTemplate,
    deleteTarget,

    // Handlers
    handleSearch,
    setPage,
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
