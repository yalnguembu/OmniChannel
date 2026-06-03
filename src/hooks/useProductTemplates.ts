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
    select: (res: any) => ({
      items: mapToTemplateModels(res?.data?.items || []),
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
    select: (res: any) => res?.data?.items || [],
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
    [activeTemplateId, templateChannelsQuery.data, linkChannelMutation, unlinkChannelMutation],
  );

  const handleSubmit = useCallback(
    (data: any) => {
      if (editingTemplate) {
        // Explicit pick of UpdateTemplateRequest fields — no id conflict, no read-only fields
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
        // CreateTemplateRequest — form data never contains id; safe to forward with productId
        createMutation.mutate({ body: { ...data, productId } });
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
    // Explicit CreateTemplateRequest — no id, no timestamps
    handleDuplicate: (t: TemplateModel) =>
      createMutation.mutate({
        body: {
          productId,
          name: `${t.name} (copie)`,
          description: t.description ?? undefined,
          status: "draft",
          subject: (t as any).subject ?? undefined,
          content: (t as any).content ?? undefined,
          language: (t as any).language ?? undefined,
          category: (t as any).category ?? undefined,
          version: (t as any).version ?? undefined,
        },
      }),
    // Explicit UpdateTemplateRequest
    handleSave: (t: TemplateModel, data: Partial<TemplateModel>) =>
      updateMutation.mutate({
        body: {
          id: t.id,
          productId: t.productId,
          name: data.name ?? t.name,
          description: data.description ?? t.description,
          status: data.status ?? t.status,
          subject: (data as any).subject ?? (t as any).subject,
          content: (data as any).content ?? (t as any).content,
          language: (data as any).language ?? (t as any).language,
          category: (data as any).category ?? (t as any).category,
          version: (data as any).version ?? (t as any).version,
        } as any,
      }),
  };
}
