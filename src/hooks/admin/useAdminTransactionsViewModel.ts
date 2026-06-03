import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  postApiWalletTransactionSearchOptions,
  postApiWalletTransactionSearchQueryKey,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import type { WalletTransactionDto } from "@/shared/api/generated/types.gen";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";

const PAGE_SIZE = 30;

/**
 * ViewModel for the admin Billing → Wallet Transactions page.
 * Uses the generated TanStack Query helpers (react-query.gen) directly and
 * exposes a flat surface (data + handlers) consumed by a dumb page component.
 * Read-only: pagination only, no mutations.
 */
export function useAdminTransactionsViewModel() {
  const { handleRequestError } = useErrorHandling();

  const [page, setPage] = useState(1);

  const query = useQuery({
    ...postApiWalletTransactionSearchOptions({
      body: {
        pageNumber: page,
        pageSize: PAGE_SIZE,
      } as any,
    }),
    select: (res: any) => ({
      items: (res?.data?.items ?? []) as WalletTransactionDto[],
      total: (res?.data?.totalCount ?? 0) as number,
    }),
  });

  useEffect(() => {
    if (query.isError && query.error) handleRequestError(query.error);
  }, [query.isError, query.error, handleRequestError]);

  const transactions = query.data?.items ?? [];
  const total = query.data?.total ?? 0;

  const creditCount = transactions.filter((t) => t.type === "credit").length;
  const debitCount = transactions.filter((t) => t.type === "debit").length;

  return {
    transactions,
    total,
    creditCount,
    debitCount,
    isLoading: query.isLoading,
    page,
    setPage,
    pageSize: PAGE_SIZE,
    queryKey: postApiWalletTransactionSearchQueryKey,
  };
}
