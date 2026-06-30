import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  postApiTriggerSearchOptions,
  postApiTriggerMutation,
  putApiTriggerMutation,
  deleteApiTriggerByIdMutation,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";
import type { TriggerDto } from "@/shared/api/generated/types.gen";

export function useEventTriggers(eventDefinitionId?: string) {
  const { handleRequestError, createMutationErrorHandler } = useErrorHandling();

  const query = useQuery({
    ...postApiTriggerSearchOptions({
      body: {
        eventDefinitionId,
        pageSize: 100,
        sortBy: "priority",
        sortDirection: "desc",
      } as any,
    }),
    select: (res) => (res?.data?.items ?? []) as TriggerDto[],
    enabled: !!eventDefinitionId,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      handleRequestError(query.error);
    }
  }, [query.isError, query.error, handleRequestError]);

  const createMutation = useMutation({
    ...postApiTriggerMutation(),
    onSuccess: () => {
      query.refetch();
    },
    onError: createMutationErrorHandler({
      toastMessage: "Erreur lors de la création du trigger",
    }),
  });

  const updateMutation = useMutation({
    ...putApiTriggerMutation(),
    onSuccess: () => {
      query.refetch();
    },
    onError: createMutationErrorHandler({
      toastMessage: "Erreur lors de la mise à jour du trigger",
    }),
  });

  const deleteMutation = useMutation({
    ...deleteApiTriggerByIdMutation(),
    onSuccess: () => {
      query.refetch();
    },
    onError: createMutationErrorHandler({
      toastMessage: "Erreur lors de la suppression du trigger",
    }),
  });

  return {
    triggers: query.data || [],
    isLoading: query.isLoading,
    refetch: query.refetch,
    createTrigger: createMutation.mutateAsync,
    updateTrigger: updateMutation.mutateAsync,
    deleteTrigger: deleteMutation.mutateAsync,
    isMutating:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
  };
}
