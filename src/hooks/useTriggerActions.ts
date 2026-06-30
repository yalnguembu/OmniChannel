import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  postApiTriggerActionSearchOptions,
  postApiTriggerActionMutation,
  putApiTriggerActionMutation,
  deleteApiTriggerActionByIdMutation,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";
import type { TriggerActionDto } from "@/shared/api/generated/types.gen";

export function useTriggerActions(triggerId?: string) {
  const { handleRequestError, createMutationErrorHandler } = useErrorHandling();

  const query = useQuery({
    ...postApiTriggerActionSearchOptions({
      body: {
        triggerId,
        pageSize: 100,
        sortBy: "orderIndex",
        sortDirection: "asc",
      } as any,
    }),
    select: (res) => (res?.data?.items ?? []) as TriggerActionDto[],
    enabled: !!triggerId,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      handleRequestError(query.error);
    }
  }, [query.isError, query.error, handleRequestError]);

  const createMutation = useMutation({
    ...postApiTriggerActionMutation(),
    onSuccess: () => {
      query.refetch();
    },
    onError: createMutationErrorHandler({
      toastMessage: "Erreur lors de la création de l'action",
    }),
  });

  const updateMutation = useMutation({
    ...putApiTriggerActionMutation(),
    onSuccess: () => {
      query.refetch();
    },
    onError: createMutationErrorHandler({
      toastMessage: "Erreur lors de la mise à jour de l'action",
    }),
  });

  const deleteMutation = useMutation({
    ...deleteApiTriggerActionByIdMutation(),
    onSuccess: () => {
      query.refetch();
    },
    onError: createMutationErrorHandler({
      toastMessage: "Erreur lors de la suppression de l'action",
    }),
  });

  return {
    actions: query.data || [],
    isLoading: query.isLoading,
    refetch: query.refetch,
    createAction: createMutation.mutateAsync,
    updateAction: updateMutation.mutateAsync,
    deleteAction: deleteMutation.mutateAsync,
    isMutating:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
  };
}
