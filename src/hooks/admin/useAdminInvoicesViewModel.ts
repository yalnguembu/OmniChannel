import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  postApiInvoiceSearchOptions,
  postApiInvoiceSearchQueryKey,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import type { InvoiceDto } from "@/shared/api/generated/types.gen";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";
import { useDebounce } from "@/shared/hooks/useDebounce";

const PAGE_SIZE = 25;

/**
 * ViewModel for the admin Billing → Invoices page.
 * Uses the generated TanStack Query helpers (react-query.gen) directly and
 * exposes a flat surface (data + handlers) consumed by a dumb page component.
 * Read-only: search + pagination, no mutations.
 */
export function useAdminInvoicesViewModel() {
  const { handleRequestError } = useErrorHandling();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const query = useQuery({
    ...postApiInvoiceSearchOptions({
      body: {
        pageNumber: page,
        pageSize: PAGE_SIZE,
        searchTerm: debouncedSearch || undefined,
      } as any,
    }),
    select: (res: any) => ({
      items: (res?.data?.items ?? []) as InvoiceDto[],
      total: (res?.data?.totalCount ?? 0) as number,
    }),
  });

  useEffect(() => {
    if (query.isError && query.error) handleRequestError(query.error);
  }, [query.isError, query.error, handleRequestError]);

  const invoices = query.data?.items ?? [];
  const total = query.data?.total ?? 0;

  const paidAmt = invoices
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + (i.total ?? 0), 0);
  const pendingAmt = invoices
    .filter((i) => i.status === "pending")
    .reduce((s, i) => s + (i.total ?? 0), 0);
  const overdueAmt = invoices
    .filter((i) => i.status === "overdue")
    .reduce((s, i) => s + (i.total ?? 0), 0);

  return {
    invoices,
    total,
    paidAmt,
    pendingAmt,
    overdueAmt,
    isLoading: query.isLoading,
    search,
    setSearch,
    page,
    setPage,
    pageSize: PAGE_SIZE,
    queryKey: postApiInvoiceSearchQueryKey,
  };
}
