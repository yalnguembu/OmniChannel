import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  postApiFlowSearchOptions,
  postApiFlowMutation,
  putApiFlowMutation,
  deleteApiFlowByIdMutation,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";
import { toast } from "sonner";

export function useProductFlows(productId: string) {
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
    ...postApiFlowSearchOptions({
      body: searchBody,
    }),
  });

  useEffect(() => {
    if (query.isError && query.error) {
      handleRequestError(query.error);
    }
  }, [query.isError, query.error, handleRequestError]);

  const createMutation = useMutation({
    ...postApiFlowMutation(),
    onSuccess: () => {
      toast.success("Flux créé avec succès");
      query.refetch();
    },
    onError: createMutationErrorHandler({
      toastMessage: "Erreur lors de la création du flux",
    }),
  });

  const updateMutation = useMutation({
    ...putApiFlowMutation(),
    onSuccess: () => {
      toast.success("Flux mis à jour avec succès");
      query.refetch();
    },
    onError: createMutationErrorHandler({
      toastMessage: "Erreur lors de la mise à jour du flux",
    }),
  });

  const deleteMutation = useMutation({
    ...deleteApiFlowByIdMutation(),
    onSuccess: () => {
      toast.success("Flux supprimé avec succès");
      query.refetch();
    },
    onError: createMutationErrorHandler({
      toastMessage: "Erreur lors de la suppression du flux",
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
    createFlow: createMutation.mutateAsync,
    updateFlow: updateMutation.mutateAsync,
    deleteFlow: deleteMutation.mutateAsync,
  };
}
