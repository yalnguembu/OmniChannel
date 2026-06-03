import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { postApiProductChannelStatisticSearchOptions } from "@/shared/api/generated/@tanstack/react-query.gen";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";

/**
 * ViewModel for the Statistics tab of a specific product.
 */
export function useProductStats(productId: string) {
  const { handleRequestError } = useErrorHandling();

  const query = useQuery({
    ...postApiProductChannelStatisticSearchOptions({
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
    stats: query.data || [],
    isLoading: query.isLoading,
    refetch: query.refetch,
    totalSent: (query.data || []).reduce(
      (acc: number, s: any) => acc + (s.messagesSent || 0),
      0,
    ),
    totalDelivered: (query.data || []).reduce(
      (acc: number, s: any) => acc + (s.messagesDelivered || 0),
      0,
    ),
    totalFailed: (query.data || []).reduce(
      (acc: number, s: any) => acc + (s.messagesFailed || 0),
      0,
    ),
    deliveryRate: (query.data || []).length > 0 ? 98.5 : 0, // Mocked rate for now
  };
}
