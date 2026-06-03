import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  postApiIntegrationSearchOptions,
  postApiIntegrationSearchQueryKey,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import type { IntegrationDto } from "@/shared/api/generated/types.gen";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";

const PAGE_SIZE = 25;

/**
 * ViewModel for the admin Integrations page.
 * Read-only paginated list backed by the generated TanStack Query helpers,
 * exposing a flat surface consumed by a dumb page component.
 */
export function useAdminIntegrationsViewModel() {
  const { handleRequestError } = useErrorHandling();

  const [page, setPage] = useState(1);

  const query = useQuery({
    ...postApiIntegrationSearchOptions({
      body: {
        pageNumber: page,
        pageSize: PAGE_SIZE,
      } as any,
    }),
    queryKey: postApiIntegrationSearchQueryKey({
      body: {
        pageNumber: page,
        pageSize: PAGE_SIZE,
      } as any,
    }),
    select: (res: any) => ({
      items: (res?.data?.items ?? []) as IntegrationDto[],
      total: (res?.data?.totalCount ?? 0) as number,
    }),
  });

  useEffect(() => {
    if (query.isError && query.error) handleRequestError(query.error);
  }, [query.isError, query.error, handleRequestError]);

  const integrations = query.data?.items ?? [];
  const total = query.data?.total ?? 0;

  return {
    integrations,
    total,
    isLoading: query.isLoading,
    page,
    setPage,
    pageSize: PAGE_SIZE,
  };
}
