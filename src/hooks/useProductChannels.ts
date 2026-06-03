import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { postApiProductChannelSearchOptions } from "@/shared/api/generated/@tanstack/react-query.gen";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";

/**
 * ViewModel for the Channels tab of a specific product.
 */
export function useProductChannels(productId: string) {
  const { handleRequestError } = useErrorHandling();

  const query = useQuery({
    ...postApiProductChannelSearchOptions({
      body: {
        productId,
        pageNumber: 1,
        pageSize: 100,
      },
    }),
    select: (res) => res?.data?.items || [],
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
    activeChannelsCount: (query.data || []).filter((c: any) => c.isActive)
      .length,
  };
}
