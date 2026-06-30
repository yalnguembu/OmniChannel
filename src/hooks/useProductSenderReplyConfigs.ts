import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  postApiSenderReplyConfigSearchOptions,
  postApiSenderReplyConfigMutation,
  putApiSenderReplyConfigMutation,
  deleteApiSenderReplyConfigByIdMutation,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";
import { toast } from "sonner";

export function useProductSenderReplyConfigs(productId: string) {
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
    ...postApiSenderReplyConfigSearchOptions({
      body: searchBody,
    }),
  });

  useEffect(() => {
    if (query.isError && query.error) {
      handleRequestError(query.error);
    }
  }, [query.isError, query.error, handleRequestError]);

  const createMutation = useMutation({
    ...postApiSenderReplyConfigMutation(),
    onSuccess: () => {
      toast.success("Configuration créée avec succès");
      query.refetch();
    },
    onError: createMutationErrorHandler({
      toastMessage: "Erreur lors de la création",
    }),
  });

  const updateMutation = useMutation({
    ...putApiSenderReplyConfigMutation(),
    onSuccess: () => {
      toast.success("Configuration mise à jour");
      query.refetch();
    },
    onError: createMutationErrorHandler({
      toastMessage: "Erreur lors de la mise à jour",
    }),
  });

  const deleteMutation = useMutation({
    ...deleteApiSenderReplyConfigByIdMutation(),
    onSuccess: () => {
      toast.success("Configuration supprimée");
      query.refetch();
    },
    onError: createMutationErrorHandler({
      toastMessage: "Erreur lors de la suppression",
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
    createConfig: createMutation.mutateAsync,
    updateConfig: updateMutation.mutateAsync,
    deleteConfig: deleteMutation.mutateAsync,
  };
}
