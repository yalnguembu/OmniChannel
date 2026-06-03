import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  postApiMessageSearchOptions,
  postApiMessageSearchQueryKey,
  postApiJobSearchOptions,
  postApiJobSearchQueryKey,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import type { MessageDto, JobDto } from "@/shared/api/generated/types.gen";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";
import { useDebounce } from "@/shared/hooks/useDebounce";

const PAGE_SIZE = 30;
export type AdminMessagesTab = "messages" | "jobs";

/**
 * ViewModel for the admin global messaging page (messages + jobs tabs).
 * Uses the generated TanStack Query helpers (react-query.gen) directly and
 * exposes a flat read-only surface consumed by a dumb page component.
 */
export function useAdminMessagesViewModel() {
  const { handleRequestError } = useErrorHandling();

  const [tab, setTab] = useState<AdminMessagesTab>("messages");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const messagesQuery = useQuery({
    ...postApiMessageSearchOptions({
      body: {
        pageNumber: page,
        pageSize: PAGE_SIZE,
        searchTerm: debouncedSearch || undefined,
      } as any,
    }),
    select: (res: any) => ({
      items: (res?.data?.items ?? []) as MessageDto[],
      total: (res?.data?.totalCount ?? 0) as number,
    }),
    enabled: tab === "messages",
  });

  useEffect(() => {
    if (messagesQuery.isError && messagesQuery.error)
      handleRequestError(messagesQuery.error);
  }, [messagesQuery.isError, messagesQuery.error, handleRequestError]);

  const jobsQuery = useQuery({
    ...postApiJobSearchOptions({
      body: {
        pageNumber: page,
        pageSize: PAGE_SIZE,
      } as any,
    }),
    select: (res: any) => ({
      items: (res?.data?.items ?? []) as JobDto[],
      total: (res?.data?.totalCount ?? 0) as number,
    }),
    enabled: tab === "jobs",
  });

  useEffect(() => {
    if (jobsQuery.isError && jobsQuery.error)
      handleRequestError(jobsQuery.error);
  }, [jobsQuery.isError, jobsQuery.error, handleRequestError]);

  const handleTabChange = (next: AdminMessagesTab) => {
    setTab(next);
    setPage(1);
  };

  return {
    tab,
    setTab: handleTabChange,
    page,
    setPage,
    pageSize: PAGE_SIZE,
    search,
    setSearch,
    messages: messagesQuery.data?.items ?? [],
    msgTotal: messagesQuery.data?.total ?? 0,
    loadingMsgs: messagesQuery.isLoading,
    jobs: jobsQuery.data?.items ?? [],
    jobTotal: jobsQuery.data?.total ?? 0,
    loadingJobs: jobsQuery.isLoading,
  };
}

// re-exported for callers needing to invalidate
export { postApiMessageSearchQueryKey, postApiJobSearchQueryKey };
