import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  postApiTemplateSearchOptions,
  getApiChannelDropdownOptions,
  postApiTemplateChannelSearchOptions,
  postApiTemplateMutation,
  putApiTemplateMutation,
  postApiTemplateChannelMutation,
  deleteApiTemplateChannelByIdMutation,
  postApiTemplateSearchQueryKey,
  postApiTemplateChannelSearchQueryKey,
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

/**
 * ViewModel for the Templates tab of a specific product.
 */
export function useProductTemplates(productId: string) {
  const queryClient = useQueryClient();
  const { handleRequestError, createMutationErrorHandler } = useErrorHandling();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TemplateModel | null>(
    null,
  );
  const pageSize = 20;

  // 1. Scoped Templates Query
  const templatesQuery = useQuery({
    ...postApiTemplateSearchOptions({
      body: {
        productId,
        pageNumber: page,
        pageSize,
        searchTerm: search || undefined,
      },
    }),
    select: (res) => ({
      items: mapToTemplateModels(
        (res?.data?.items as SearchTemplateResponse[]) || [],
      ),
      totalCount: res?.data?.totalCount || 0,
    }),
    enabled: !!productId,
  });

  useEffect(() => {
    if (templatesQuery.isError && templatesQuery.error) {
      handleRequestError(templatesQuery.error);
    }
  }, [templatesQuery.isError, templatesQuery.error, handleRequestError]);

  // 2. Channels for Dropdown/Linking
  const channelsQuery = useQuery({
    ...getApiChannelDropdownOptions(),
    select: (res: any) => res?.data || [],
  });

  // 3. Current active template
  const activeTemplate =
    templatesQuery.data?.items.find((t) => t.id === activeTemplateId) || null;

  // 4. Linked channels for the active template
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

  // Mutations
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

  const linkChannelMutation = useMutation({
    ...postApiTemplateChannelMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: postApiTemplateChannelSearchQueryKey(),
      });
      toast.success("Lien mis à jour");
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
      toast.success("Lien mis à jour");
    },
    onError: createMutationErrorHandler({
      toastMessage: "Erreur lors de la mise à jour",
    }),
  });

  const handleToggleChannel = useCallback(
    async (channelId: string, linked: boolean) => {
      if (!activeTemplateId) return;
      
      if (linked) {
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
    [activeTemplateId, templateChannelsQuery.data, linkChannelMutation, unlinkChannelMutation],
  );

  const handleSubmit = useCallback(
    (data: TemplateModel) => {
      if (editingTemplate) {
        // Explicit pick of UpdateTemplateRequest fields — no id conflict, no read-only fields.
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
        // CreateTemplateRequest — form data never contains id; scope to this product.
        const body: CreateTemplateRequest = {
          productId,
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
    [editingTemplate, updateMutation, createMutation, productId],
  );

  return {
    templates: templatesQuery.data?.items || [],
    totalCount: templatesQuery.data?.totalCount || 0,
    search,
    page,
    activeTemplate,
    tplChannels: templateChannelsQuery.data || [],
    channels: channelsQuery.data || [],
    isLoading: templatesQuery.isLoading,
    isActionPending: createMutation.isPending || updateMutation.isPending,
    isModalOpen,
    editingTemplate,

    // Handlers
    setSearch: (v: string) => {
      setSearch(v);
      setPage(1);
    },
    setPage,
    setActiveTemplateId,
    setIsModalOpen,
    setEditingTemplate,
    handleToggleChannel,
    handleSubmit,
    // Explicit CreateTemplateRequest — no id, no timestamps.
    // subject/content/version live on the TemplateChannel variant —
    // use PUT /api/TemplateChannel/variant to edit per-channel content after creation.
    handleDuplicate: (t: TemplateModel) => {
      const body: CreateTemplateRequest = {
        productId,
        name: `${t.name} (copie)`,
        description: t.description ?? undefined,
        status: "draft",
        category: t.category ?? undefined,
        defaultLanguage: t.language ?? undefined,
      };
      createMutation.mutate({ body });
    },
    // Explicit UpdateTemplateRequest — subject/content live on the variant.
    handleSave: (t: TemplateModel, data: Partial<TemplateModel>) => {
      const body: UpdateTemplateRequest = {
        id: t.id,
        productId: t.productId,
        name: data.name ?? t.name,
        description: data.description ?? t.description,
        status: data.status ?? t.status,
        category: data.category ?? t.category,
        defaultLanguage: data.language ?? t.language,
        version: data.version ?? t.version,
      };
      updateMutation.mutate({ body });
    },
  };
}
