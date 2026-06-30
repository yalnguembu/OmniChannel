import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  postApiEventFunnelSearchOptions,
  postApiEventFunnelMutation,
  putApiEventFunnelMutation,
  deleteApiEventFunnelByIdMutation,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";
import { toast } from "sonner";

export function useProductFunnels(productId: string) {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");
  const { handleRequestError, createMutationErrorHandler } = useErrorHandling();

  const searchBody = {
    productId,
    pageIndex: pageIndex + 1,
    pageSize,
    searchQuery: searchQuery || undefined,
  };

  const query = useQuery({
    ...postApiEventFunnelSearchOptions({
      body: searchBody,
    }),
  });

  useEffect(() => {
    if (query.isError && query.error) {
      handleRequestError(query.error);
    }
  }, [query.isError, query.error, handleRequestError]);

  const createMutation = useMutation({
    ...postApiEventFunnelMutation(),
    onSuccess: () => {
      toast.success("Tunnel créé avec succès");
      query.refetch();
    },
    onError: createMutationErrorHandler({
      toastMessage: "Erreur lors de la création du tunnel",
    }),
  });

  const updateMutation = useMutation({
    ...putApiEventFunnelMutation(),
    onSuccess: () => {
      toast.success("Tunnel mis à jour avec succès");
      query.refetch();
    },
    onError: createMutationErrorHandler({
      toastMessage: "Erreur lors de la mise à jour du tunnel",
    }),
  });

  const deleteMutation = useMutation({
    ...deleteApiEventFunnelByIdMutation(),
    onSuccess: () => {
      toast.success("Tunnel supprimé avec succès");
      query.refetch();
    },
    onError: createMutationErrorHandler({
      toastMessage: "Erreur lors de la suppression du tunnel",
    }),
  });

  return {
    data: query.data?.data,
    isLoading: query.isLoading,
    isMutating:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
    pagination: {
      pageIndex,
      pageSize,
      setPageIndex,
      setPageSize,
    },
    search: {
      query: searchQuery,
      setQuery: setSearchQuery,
    },
    refetch: query.refetch,
    createFunnel: createMutation.mutateAsync,
    updateFunnel: updateMutation.mutateAsync,
    deleteFunnel: deleteMutation.mutateAsync,
  };
}
