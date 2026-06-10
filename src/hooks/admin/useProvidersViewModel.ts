import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  postApiProviderSearchOptions,
  postApiProviderSearchQueryKey,
  postApiProviderMutation,
  putApiProviderMutation,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import type {
  CreateProviderRequest,
  UpdateProviderRequest,
  SearchProviderResponse,
} from "@/shared/api/generated/types.gen";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";
import { useDebounce } from "@/shared/hooks/useDebounce";

const PAGE_SIZE = 12;
export type ProviderView = "card" | "table";

/**
 * ViewModel for the admin Providers page.
 * Uses the generated TanStack Query helpers (react-query.gen) directly and
 * exposes a flat surface (data + handlers) consumed by a dumb page component.
 */
export function useProvidersViewModel() {
  const queryClient = useQueryClient();
  const { handleRequestError, createMutationErrorHandler } = useErrorHandling();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [view, setView] = useState<ProviderView>("card");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] =
    useState<SearchProviderResponse | null>(null);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const query = useQuery({
    ...postApiProviderSearchOptions({
      body: {
        pageNumber: page,
        pageSize: PAGE_SIZE,
        searchTerm: debouncedSearch || undefined,
      },
    }),
    select: (res) => ({
      items: (res?.data?.items ?? []) as SearchProviderResponse[],
      total: res?.data?.totalCount ?? 0,
    }),
  });

  useEffect(() => {
    if (query.isError && query.error) handleRequestError(query.error);
  }, [query.isError, query.error, handleRequestError]);

  const providers = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const activeCount = providers.filter((p) => p.isActive).length;

  const invalidate = useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: postApiProviderSearchQueryKey(),
      }),
    [queryClient],
  );

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingProvider(null);
  }, []);

  const createMutation = useMutation({
    ...postApiProviderMutation(),
    onSuccess: () => {
      invalidate();
      handleCloseModal();
      toast.success("Provider créé");
    },
    onError: createMutationErrorHandler(),
  });

  const updateMutation = useMutation({
    ...putApiProviderMutation(),
    onSuccess: () => {
      invalidate();
      handleCloseModal();
      toast.success("Provider modifié");
    },
    onError: createMutationErrorHandler(),
  });

  const handleOpenCreate = useCallback(() => {
    setEditingProvider(null);
    setIsModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((provider: SearchProviderResponse) => {
    setEditingProvider(provider);
    setIsModalOpen(true);
  }, []);

  const handleSubmit = useCallback(
    (data: CreateProviderRequest) => {
      if (editingProvider) {
        const body: UpdateProviderRequest = {
          ...data,
          id: editingProvider.id,
        };
        updateMutation.mutate({ body });
      } else {
        createMutation.mutate({ body: data });
      }
    },
    [editingProvider, updateMutation, createMutation],
  );

  return {
    providers,
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
    editingProvider,
    isActionPending: createMutation.isPending || updateMutation.isPending,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseModal,
    handleSubmit,
  };
}
