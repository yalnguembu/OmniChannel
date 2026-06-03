import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  postApiSysLogSearchOptions,
  postApiSysLogSearchQueryKey,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import type { SysLogDto } from "@/shared/api/generated/types.gen";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";

const PAGE_SIZE = 30;

/**
 * ViewModel for the admin System Logs page.
 * Uses the generated TanStack Query helpers (react-query.gen) directly and
 * exposes a flat read-only surface consumed by a dumb page component.
 */
export function useAdminSystemLogsViewModel() {
  const { handleRequestError } = useErrorHandling();

  const [page, setPage] = useState(1);
  const [levelFilter, setLevelFilter] = useState("");

  useEffect(() => {
    setPage(1);
  }, [levelFilter]);

  const query = useQuery({
    ...postApiSysLogSearchOptions({
      body: {
        pageNumber: page,
        pageSize: PAGE_SIZE,
        logLevel: levelFilter || undefined,
      } as any,
    }),
    select: (res: any) => ({
      items: (res?.data?.items ?? []) as SysLogDto[],
      total: (res?.data?.totalCount ?? 0) as number,
    }),
  });

  useEffect(() => {
    if (query.isError && query.error) handleRequestError(query.error);
  }, [query.isError, query.error, handleRequestError]);

  const logs = query.data?.items ?? [];
  const total = query.data?.total ?? 0;

  const errorCount = logs.filter(
    (l) => l.logLevel?.toLowerCase() === "error",
  ).length;
  const warnCount = logs.filter((l) =>
    ["warning", "warn"].includes(l.logLevel?.toLowerCase() ?? ""),
  ).length;

  return {
    logs,
    total,
    errorCount,
    warnCount,
    isLoading: query.isLoading,
    page,
    setPage,
    pageSize: PAGE_SIZE,
    levelFilter,
    setLevelFilter,
    queryKey: postApiSysLogSearchQueryKey,
  };
}
