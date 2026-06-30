import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  postApiEventDefinitionSearchOptions,
  getApiEventEngineMetadataOptions,
  postApiEventDefinitionMutation,
  putApiEventDefinitionMutation,
  deleteApiEventDefinitionByIdMutation,
  postApiEventEngineValidateMatchruleMutation,
  postApiEventEngineValidateConditionMutation,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";
import type {
  EventDefinitionDto,
  EventEngineMetadataResponse,
} from "@/shared/api/generated/types.gen";
import { useListFilters } from "@/hooks/useListFilters";
import type { FilterFieldConfig } from "@/components/features/shared/ListFilterBar";

const ADVANCED_DEFAULTS = {
  code: "",
  origin: "",
  senderId: "",
  isActive: "",
  ids: "",
  sortBy: "createdAt",
  sortDirection: "desc",
  pageSize: "100",
};

export const EVENT_DEFINITION_FILTER_FIELDS: FilterFieldConfig[] = [
  {
    key: "code",
    label: "Code",
    type: "text",
    placeholder: "Code de l'événement",
  },
  {
    key: "origin",
    label: "Origine",
    type: "select",
    options: [
      { value: "", label: "Toutes les origines" },
      { value: "Internal", label: "Internal" },
      { value: "External", label: "External" },
    ],
  },
  {
    key: "isActive",
    label: "Statut",
    type: "select",
    options: [
      { value: "", label: "Tous" },
      { value: "true", label: "Actif" },
      { value: "false", label: "Inactif" },
    ],
  },
  {
    key: "senderId",
    label: "ID de l'expéditeur",
    type: "text",
    placeholder: "ID du sender",
  },
  {
    key: "ids",
    label: "IDs",
    type: "text",
    placeholder: "id1, id2…",
    help: "Séparés par des virgules.",
    fullWidth: true,
  },
  {
    key: "sortBy",
    label: "Trier par",
    type: "select",
    options: [
      { value: "createdAt", label: "Date de création" },
      { value: "code", label: "Code" },
    ],
  },
  {
    key: "sortDirection",
    label: "Ordre",
    type: "select",
    options: [
      { value: "desc", label: "Décroissant" },
      { value: "asc", label: "Croissant" },
    ],
  },
  {
    key: "pageSize",
    label: "Par page",
    type: "select",
    options: [
      { value: "50", label: "50" },
      { value: "100", label: "100" },
      { value: "200", label: "200" },
    ],
  },
];

export function useProductEvents(productId: string) {
  const { handleRequestError, createMutationErrorHandler } = useErrorHandling();
  const filters = useListFilters(ADVANCED_DEFAULTS);

  const metadataQuery = useQuery({
    ...getApiEventEngineMetadataOptions(),
    select: (res) => res?.data as EventEngineMetadataResponse | undefined,
    staleTime: 5 * 60 * 1000,
  });

  const query = useQuery({
    ...postApiEventDefinitionSearchOptions({
      body: {
        productId,
        ...filters.commonBody(),
        code: filters.advanced.code?.trim() || undefined,
        origin: filters.advanced.origin?.trim() || undefined,
        senderId: filters.advanced.senderId?.trim() || undefined,
        isActive: filters.advanced.isActive
          ? filters.advanced.isActive === "true"
          : undefined,
      } as any,
    }),
    select: (res) => (res?.data?.items ?? []) as EventDefinitionDto[],
    enabled: !!productId,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      handleRequestError(query.error);
    }
  }, [query.isError, query.error, handleRequestError]);

  useEffect(() => {
    if (metadataQuery.isError && metadataQuery.error) {
      handleRequestError(metadataQuery.error);
    }
  }, [metadataQuery.isError, metadataQuery.error, handleRequestError]);

  const createMutation = useMutation({
    ...postApiEventDefinitionMutation(),
    onSuccess: () => {
      query.refetch();
    },
    onError: createMutationErrorHandler({
      toastMessage: "Erreur lors de la création de l'événement",
    }),
  });

  const updateMutation = useMutation({
    ...putApiEventDefinitionMutation(),
    onSuccess: () => {
      query.refetch();
    },
    onError: createMutationErrorHandler({
      toastMessage: "Erreur lors de la mise à jour de l'événement",
    }),
  });

  const deleteMutation = useMutation({
    ...deleteApiEventDefinitionByIdMutation(),
    onSuccess: () => {
      query.refetch();
    },
    onError: createMutationErrorHandler({
      toastMessage: "Erreur lors de la suppression de l'événement",
    }),
  });

  const validateMatchRuleMutation = useMutation({
    ...postApiEventEngineValidateMatchruleMutation(),
    onError: createMutationErrorHandler({
      toastMessage: "Erreur lors de la validation de la règle",
    }),
  });

  const validateConditionMutation = useMutation({
    ...postApiEventEngineValidateConditionMutation(),
    onError: createMutationErrorHandler({
      toastMessage: "Erreur lors de la validation de la condition",
    }),
  });

  return {
    events: query.data || [],
    isLoading: query.isLoading,
    isMetadataLoading: metadataQuery.isLoading,
    metadata: metadataQuery.data,
    refetch: query.refetch,
    count: (query.data || []).length,
    filters,
    filterFields: EVENT_DEFINITION_FILTER_FIELDS,
    createEvent: createMutation.mutateAsync,
    updateEvent: updateMutation.mutateAsync,
    deleteEvent: deleteMutation.mutateAsync,
    validateMatchRule: validateMatchRuleMutation.mutateAsync,
    validateCondition: validateConditionMutation.mutateAsync,
    isMutating:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
  };
}
