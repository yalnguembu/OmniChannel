import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { postApiProductChannelSearchOptions } from "@/shared/api/generated/@tanstack/react-query.gen";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";
import type { SearchProductChannelResponse } from "@/shared/api/generated/types.gen";
import { useListFilters } from "@/hooks/useListFilters";
import type { FilterFieldConfig } from "@/components/features/shared/ListFilterBar";

const ADVANCED_DEFAULTS = {
  channelId: "",
  priority: "",
  ids: "",
  sortBy: "createdAt",
  sortDirection: "desc",
  pageSize: "100",
};

/** Advanced (modal) filter fields for product channels — SearchProductChannelRequest. */
export const CHANNEL_FILTER_FIELDS: FilterFieldConfig[] = [
  { key: "channelId", label: "ID du canal", type: "text", placeholder: "channel id" },
  { key: "priority", label: "Priorité", type: "number", placeholder: "ex: 1" },
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
 * ViewModel for the Channels tab of a specific product.
 */
export function useProductChannels(productId: string) {
  const { handleRequestError } = useErrorHandling();
  const filters = useListFilters(ADVANCED_DEFAULTS);

  const query = useQuery({
    ...postApiProductChannelSearchOptions({
      body: {
        productId,
        ...filters.commonBody(),
        channelId: filters.advanced.channelId?.trim() || undefined,
        priority: filters.advanced.priority?.trim()
          ? Number(filters.advanced.priority)
          : undefined,
      } as any,
    }),
    select: (res) =>
      (res?.data?.items ?? []) as SearchProductChannelResponse[],
    enabled: !!productId,
  });

  useEffect(() => {
    if (query.isError && query.error) {
      handleRequestError(query.error);
    }
  }, [query.isError, query.error, handleRequestError]);

  return {
    channels: query.data || [],
    isLoading: query.isLoading,
    refetch: query.refetch,
    activeChannelsCount: (query.data ?? []).filter((c) => c.isActive).length,
    filters,
    filterFields: CHANNEL_FILTER_FIELDS,
  };
}
