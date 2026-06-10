import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  postApiSenderSearchOptions,
  getApiSenderDropdownOptions,
  getApiChannelDropdownOptions,
  postApiSenderMutation,
  putApiSenderMutation,
  deleteApiSenderByIdMutation,
  postApiSenderSearchQueryKey,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";
import type {
  SearchSenderResponse,
  CreateSenderRequest,
} from "@/shared/api/generated/types.gen";

/**
 * ViewModel for the Senders management page.
 * Senders are registered originating addresses used when sending SMS / WhatsApp messages.
 */
export function useSenderViewModel() {
  const queryClient = useQueryClient();
  const { handleRequestError, createMutationErrorHandler } = useErrorHandling();

  // --- State ---
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSender, setEditingSender] =
    useState<SearchSenderResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SearchSenderResponse | null>(
    null,
  );
  const pageSize = 20;

  // --- Queries ---

  const sendersQuery = useQuery({
    ...postApiSenderSearchOptions({
      body: {
        pageNumber: page,
        pageSize,
        searchTerm: search || undefined,
      },
    }),
    select: (res) => ({
      items: (res?.data?.items || []) as SearchSenderResponse[],
      totalCount: res?.data?.totalCount || 0,
    }),
    placeholderData: (prev) => prev,
  });

  useEffect(() => {
    if (sendersQuery.isError && sendersQuery.error) {
      handleRequestError(sendersQuery.error);
    }
  }, [sendersQuery.isError, sendersQuery.error, handleRequestError]);

  const channelsQuery = useQuery({
    ...getApiChannelDropdownOptions(),
    select: (res) => (res?.data || []) as Array<{ id: string; name: string }>,
  });

  // Dropdown for WhatsApp store / campaign selector
  const senderDropdownQuery = useQuery({
    ...getApiSenderDropdownOptions(),
    select: (res) => (res?.data || []) as Array<{ id: string; name: string }>,
  });

  // --- Mutations ---

  const createMutation = useMutation({
    ...postApiSenderMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postApiSenderSearchQueryKey() });
      setIsModalOpen(false);
      toast.success("Expéditeur créé");
    },
    onError: createMutationErrorHandler(),
  });

  const updateMutation = useMutation({
    ...putApiSenderMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postApiSenderSearchQueryKey() });
      setIsModalOpen(false);
      setEditingSender(null);
      toast.success("Expéditeur mis à jour");
    },
    onError: createMutationErrorHandler(),
  });

  const deleteMutation = useMutation({
    ...deleteApiSenderByIdMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postApiSenderSearchQueryKey() });
      setDeleteTarget(null);
      toast.success("Expéditeur supprimé");
    },
    onError: createMutationErrorHandler(),
  });

  // --- Handlers ---

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleOpenCreate = useCallback(() => {
    setEditingSender(null);
    setIsModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((sender: SearchSenderResponse) => {
    setEditingSender(sender);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingSender(null);
  }, []);

  const handleSubmit = useCallback(
    (data: CreateSenderRequest) => {
      if (editingSender) {
        updateMutation.mutate({
          body: {
            id: editingSender.id,
            channelId: data.channelId ?? editingSender.channelId,
            externalId: data.externalId ?? editingSender.externalId,
            address: data.address ?? editingSender.address,
            displayName: data.displayName ?? editingSender.displayName,
            status: data.status ?? editingSender.status,
          },
        });
      } else {
        createMutation.mutate({ body: data });
      }
    },
    [editingSender, updateMutation, createMutation],
  );

  const handleConfirmDelete = useCallback((sender: SearchSenderResponse) => {
    setDeleteTarget(sender);
  }, []);

  const handleCancelDelete = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  return {
    // Data
    senders: sendersQuery.data?.items || [],
    totalCount: sendersQuery.data?.totalCount || 0,
    channels: channelsQuery.data || [],
    senderDropdown: senderDropdownQuery.data || [],
    search,
    page,

    // Loading states
    isLoading: sendersQuery.isLoading,
    isActionLoading: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,

    // Modal state
    isModalOpen,
    editingSender,
    deleteTarget,

    // Handlers
    handleSearch,
    setPage,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseModal,
    handleSubmit,
    handleConfirmDelete,
    handleCancelDelete,
    handleDelete: () =>
      deleteTarget && deleteMutation.mutate({ path: { id: deleteTarget.id! } }),
  };
}
