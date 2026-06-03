import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  postApiChannelSearchOptions,
  postApiChannelSearchQueryKey,
  postApiChannelMutation,
  putApiChannelMutation,
  deleteApiChannelByIdMutation,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import type { ChannelDto } from "@/shared/api/generated/types.gen";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";
import { useDebounce } from "@/shared/hooks/useDebounce";

const PAGE_SIZE = 12;
export type ChannelView = "card" | "table";

/**
 * ViewModel for the admin Channels page.
 * Uses the generated TanStack Query helpers (react-query.gen) directly and
 * exposes a flat surface (data + handlers) consumed by a dumb page component.
 */
export function useAdminChannelsViewModel() {
  const queryClient = useQueryClient();
  const { handleRequestError, createMutationErrorHandler } = useErrorHandling();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [view, setView] = useState<ChannelView>("card");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<ChannelDto | null>(null);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const query = useQuery({
    ...postApiChannelSearchOptions({
      body: {
        pageNumber: page,
        pageSize: PAGE_SIZE,
        searchTerm: debouncedSearch || undefined,
      } as any,
    }),
    select: (res: any) => ({
      items: (res?.data?.items ?? []) as ChannelDto[],
      total: (res?.data?.totalCount ?? 0) as number,
    }),
  });

  useEffect(() => {
    if (query.isError && query.error) handleRequestError(query.error);
  }, [query.isError, query.error, handleRequestError]);

  const channels = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const activeCount = channels.filter((c) => c.isActive).length;

  const invalidate = useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: postApiChannelSearchQueryKey(),
      }),
    [queryClient],
  );

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingChannel(null);
  }, []);

  const createMutation = useMutation({
    ...postApiChannelMutation(),
    onSuccess: () => {
      invalidate();
      handleCloseModal();
      toast.success("Canal créé");
    },
    onError: createMutationErrorHandler(),
  });

  const updateMutation = useMutation({
    ...putApiChannelMutation(),
    onSuccess: () => {
      invalidate();
      handleCloseModal();
      toast.success("Canal modifié");
    },
    onError: createMutationErrorHandler(),
  });

  const deleteMutation = useMutation({
    ...deleteApiChannelByIdMutation(),
    onSuccess: () => {
      invalidate();
      toast.success("Canal supprimé");
    },
    onError: createMutationErrorHandler(),
  });

  const handleOpenCreate = useCallback(() => {
    setEditingChannel(null);
    setIsModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((channel: ChannelDto) => {
    setEditingChannel(channel);
    setIsModalOpen(true);
  }, []);

  const handleSubmit = useCallback(
    (data: Partial<ChannelDto>) => {
      if (editingChannel) {
        updateMutation.mutate({ body: { ...editingChannel, ...data } as any });
      } else {
        createMutation.mutate({ body: data as any });
      }
    },
    [editingChannel, updateMutation, createMutation],
  );

  const handleDelete = useCallback(
    (channel: ChannelDto) => {
      if (!channel.id) return;
      deleteMutation.mutate({ path: { id: channel.id } });
    },
    [deleteMutation],
  );

  return {
    channels,
    total,
    activeCount,
    isLoading: query.isLoading,
    search,
    setSearch,
    page,
    setPage,
    pageSize: PAGE_SIZE,
    view,
    setView,
    isModalOpen,
    editingChannel,
    isActionPending: createMutation.isPending || updateMutation.isPending,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseModal,
    handleSubmit,
    handleDelete,
  };
}
