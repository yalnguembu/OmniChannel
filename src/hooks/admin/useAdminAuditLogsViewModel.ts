import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  postApiAuditLogSearchOptions,
  postApiAuditLogSearchQueryKey,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import type { SearchAuditLogResponse } from "@/shared/api/generated/types.gen";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";
import { useDebounce } from "@/shared/hooks/useDebounce";

const PAGE_SIZE = 30;

/**
 * ViewModel for the admin Audit Logs page.
 * Uses the generated TanStack Query helpers (react-query.gen) directly and
 * exposes a flat read-only surface consumed by a dumb page component.
 */
export function useAdminAuditLogsViewModel() {
  const { handleRequestError } = useErrorHandling();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("");

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, riskFilter]);

  const query = useQuery({
    ...postApiAuditLogSearchOptions({
      body: {
        pageNumber: page,
        pageSize: PAGE_SIZE,
        searchTerm: debouncedSearch || undefined,
        riskLevel: riskFilter || undefined,
      } as any,
    }),
    select: (res) => ({
      items: (res?.data?.items ?? []) as SearchAuditLogResponse[],
      total: (res?.data?.totalCount ?? 0) as number,
    }),
  });

  useEffect(() => {
    if (query.isError && query.error) handleRequestError(query.error);
  }, [query.isError, query.error, handleRequestError]);

  return {
    logs: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    page,
    setPage,
    pageSize: PAGE_SIZE,
    search,
    setSearch,
    riskFilter,
    setRiskFilter,
  };
}

// re-exported for callers needing to invalidate
export { postApiAuditLogSearchQueryKey };
