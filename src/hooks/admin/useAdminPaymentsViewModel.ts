import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  postApiPaymentSearchOptions,
  postApiPaymentSearchQueryKey,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import type { PaymentDto } from "@/shared/api/generated/types.gen";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";
import { useDebounce } from "@/shared/hooks/useDebounce";

const PAGE_SIZE = 25;

/**
 * ViewModel for the admin Billing → Payments page.
 * Uses the generated TanStack Query helpers (react-query.gen) directly and
 * exposes a flat surface (data + handlers) consumed by a dumb page component.
 * Read-only: search + pagination, no mutations.
 */
export function useAdminPaymentsViewModel() {
  const { handleRequestError } = useErrorHandling();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const query = useQuery({
    ...postApiPaymentSearchOptions({
      body: {
        pageNumber: page,
        pageSize: PAGE_SIZE,
        searchTerm: debouncedSearch || undefined,
      } as any,
    }),
    select: (res: any) => ({
      items: (res?.data?.items ?? []) as PaymentDto[],
      total: (res?.data?.totalCount ?? 0) as number,
    }),
  });

  useEffect(() => {
    if (query.isError && query.error) handleRequestError(query.error);
  }, [query.isError, query.error, handleRequestError]);

  const payments = query.data?.items ?? [];
  const total = query.data?.total ?? 0;

  const totalCompleted = payments
    .filter((p) => p.status === "completed")
    .reduce((s, p) => s + (p.amount ?? 0), 0);
  const totalPending = payments
    .filter((p) => p.status === "pending")
    .reduce((s, p) => s + (p.amount ?? 0), 0);

  return {
    payments,
    total,
    totalCompleted,
    totalPending,
    isLoading: query.isLoading,
    search,
    setSearch,
    page,
    setPage,
    pageSize: PAGE_SIZE,
    queryKey: postApiPaymentSearchQueryKey,
  };
}
