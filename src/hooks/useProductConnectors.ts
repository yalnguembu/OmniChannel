import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { postApiConnectorSearchOptions } from "@/shared/api/generated/@tanstack/react-query.gen";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";
import type { SearchConnectorResponse } from "@/shared/api/generated/types.gen";
import { useListFilters } from "@/hooks/useListFilters";
import type { FilterFieldConfig } from "@/components/features/shared/ListFilterBar";

const ADVANCED_DEFAULTS = {
  name: "",
  priority: "",
  lastTestStatus: "",
  providerId: "",
  ids: "",
  sortBy: "createdAt",
  sortDirection: "desc",
  pageSize: "100",
};

/** Advanced (modal) filter fields for product connectors — SearchConnectorRequest. */
export const CONNECTOR_FILTER_FIELDS: FilterFieldConfig[] = [
  { key: "name", label: "Nom", type: "text", placeholder: "Nom du connecteur" },
  {
    key: "lastTestStatus",
    label: "Dernier test",
    type: "text",
    placeholder: "success, failed…",
  },
  { key: "priority", label: "Priorité", type: "number", placeholder: "ex: 1" },
  { key: "providerId", label: "ID du provider", type: "text", placeholder: "provider id" },
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
      { value: "name", label: "Nom" },
      { value: "priority", label: "Priorité" },
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

/**
 * ViewModel for the Connectors tab of a specific product.
 */
export function useProductConnectors(productId: string) {
  const { handleRequestError } = useErrorHandling();
  const filters = useListFilters(ADVANCED_DEFAULTS);

  const query = useQuery({
    ...postApiConnectorSearchOptions({
      body: {
        productId,
        ...filters.commonBody(),
        name: filters.advanced.name?.trim() || undefined,
        lastTestStatus: filters.advanced.lastTestStatus?.trim() || undefined,
        providerId: filters.advanced.providerId?.trim() || undefined,
        priority: filters.advanced.priority?.trim()
          ? Number(filters.advanced.priority)
          : undefined,
      } as any,
    }),
    select: (res) => (res?.data?.items ?? []) as SearchConnectorResponse[],
    enabled: !!productId,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      handleRequestError(query.error);
    }
  }, [query.isError, query.error, handleRequestError]);

  return {
    connectors: query.data || [],
    isLoading: query.isLoading,
    refetch: query.refetch,
    count: (query.data || []).length,
    filters,
    filterFields: CONNECTOR_FILTER_FIELDS,
  };
}
