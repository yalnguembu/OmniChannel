import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { postApiConnectorSearchOptions } from "@/shared/api/generated/@tanstack/react-query.gen";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";

/**
 * ViewModel for the Connectors tab of a specific product.
 */
export function useProductConnectors(productId: string) {
  const { handleRequestError } = useErrorHandling();

  const query = useQuery({
    ...postApiConnectorSearchOptions({
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
    connectors: query.data || [],
    isLoading: query.isLoading,
    refetch: query.refetch,
    count: (query.data || []).length,
  };
}
