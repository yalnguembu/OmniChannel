import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  postApiEventFunnelStepSearchOptions,
  postApiEventFunnelStepMutation,
  putApiEventFunnelStepMutation,
  deleteApiEventFunnelStepByIdMutation,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";
import type { EventFunnelStepDto } from "@/shared/api/generated/types.gen";
import { toast } from "sonner";

export function useFunnelSteps(funnelId?: string) {
  const { handleRequestError, createMutationErrorHandler } = useErrorHandling();

  const query = useQuery({
    ...postApiEventFunnelStepSearchOptions({
      body: {
        funnelId,
        pageSize: 100,
        sortBy: "orderIndex",
        sortDirection: "asc",
      } as any,
    }),
    select: (res) => (res?.data?.items ?? []) as EventFunnelStepDto[],
    enabled: !!funnelId,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      handleRequestError(query.error);
    }
  }, [query.isError, query.error, handleRequestError]);

  const createMutation = useMutation({
    ...postApiEventFunnelStepMutation(),
    onSuccess: () => {
      toast.success("Étape ajoutée avec succès");
      query.refetch();
    },
    onError: createMutationErrorHandler({
      toastMessage: "Erreur lors de l'ajout de l'étape",
    }),
  });

  const updateMutation = useMutation({
    ...putApiEventFunnelStepMutation(),
    onSuccess: () => {
      toast.success("Étape mise à jour");
      query.refetch();
    },
    onError: createMutationErrorHandler({
      toastMessage: "Erreur lors de la mise à jour",
    }),
  });

  const deleteMutation = useMutation({
    ...deleteApiEventFunnelStepByIdMutation(),
    onSuccess: () => {
      toast.success("Étape supprimée");
      query.refetch();
    },
    onError: createMutationErrorHandler({
      toastMessage: "Erreur lors de la suppression",
    }),
  });

  return {
    steps: query.data || [],
    isLoading: query.isLoading,
    refetch: query.refetch,
    createStep: createMutation.mutateAsync,
    updateStep: updateMutation.mutateAsync,
    deleteStep: deleteMutation.mutateAsync,
    isMutating:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
  };
}
