import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { postApiMessageSearchOptions } from "@/shared/api/generated/@tanstack/react-query.gen";
import type { SearchMessageResponse } from "@/shared/api/generated/types.gen";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";

/**
 * Hook for managing campaign's individual message delivery tracking.
 * Pass `options.enabled = false` to skip fetching until the messages tab is active.
 */
export function useCampaignMessages(
  campaignId: string,
  options?: { enabled?: boolean },
) {
  const { handleRequestError } = useErrorHandling();
  const [page, setPage] = useState(1);
  const pageSize = 50;
  const isEnabled = options?.enabled ?? true;

  const messagesQuery = useQuery({
    ...postApiMessageSearchOptions({
      body: {
        campaignId,
        pageNumber: page,
        pageSize,
      },
    }),
    select: (res) => ({
      items: (res?.data?.items as SearchMessageResponse[]) || [],
      totalCount: res?.data?.totalCount || 0,
    }),
    enabled: !!campaignId && isEnabled,
  });

  useEffect(() => {
    if (messagesQuery.isError && messagesQuery.error) {
      handleRequestError(messagesQuery.error);
    }
  }, [messagesQuery.isError, messagesQuery.error, handleRequestError]);

  return {
    messages: messagesQuery.data?.items || [],
    totalCount: messagesQuery.data?.totalCount || 0,
    page,
    setPage,
    isLoading: messagesQuery.isLoading,
    refetch: messagesQuery.refetch,
  };
}
