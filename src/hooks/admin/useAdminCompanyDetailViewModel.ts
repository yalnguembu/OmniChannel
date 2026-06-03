import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getApiCompanyDetailByIdOptions,
  postApiSubscriptionSearchOptions,
  postApiWalletSearchOptions,
  postApiWalletTransactionSearchOptions,
  postApiUserSearchOptions,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import type {
  CompanyDto,
  SubscriptionDto,
  WalletDto,
  WalletTransactionDto,
  UserDto,
} from "@/shared/api/generated/types.gen";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";

/**
 * ViewModel for the admin Company detail page (read-only).
 * Loads the company via the by-id endpoint and lazily loads each tab's data
 * (subscription / wallet / transactions / users) gated on the active tab.
 */
export function useAdminCompanyDetailViewModel(companyId: string) {
  const { handleRequestError } = useErrorHandling();

  const [tab, setTab] = useState("info");

  const companyQuery = useQuery({
    ...getApiCompanyDetailByIdOptions({ path: { id: companyId } }),
    select: (res: any) => res?.data as CompanyDto,
  });

  const subQuery = useQuery({
    ...postApiSubscriptionSearchOptions({
      body: { companyId, pageNumber: 1, pageSize: 1 } as any,
    }),
    select: (res: any) => (res?.data?.items?.[0] ?? null) as SubscriptionDto | null,
    enabled: tab === "subscription",
  });

  const walletQuery = useQuery({
    ...postApiWalletSearchOptions({
      body: { companyId, pageNumber: 1, pageSize: 1 } as any,
    }),
    select: (res: any) => (res?.data?.items?.[0] ?? null) as WalletDto | null,
    enabled: tab === "wallet",
  });

  const txQuery = useQuery({
    ...postApiWalletTransactionSearchOptions({
      body: { companyId, pageNumber: 1, pageSize: 20 } as any,
    }),
    select: (res: any) => (res?.data?.items ?? []) as WalletTransactionDto[],
    enabled: tab === "wallet",
  });

  const usersQuery = useQuery({
    ...postApiUserSearchOptions({
      body: { companyId, pageNumber: 1, pageSize: 50 } as any,
    }),
    select: (res: any) => (res?.data?.items ?? []) as UserDto[],
    enabled: tab === "users",
  });

  useEffect(() => {
    const q = [companyQuery, subQuery, walletQuery, txQuery, usersQuery].find(
      (x) => x.isError && x.error,
    );
    if (q?.error) handleRequestError(q.error);
  }, [
    companyQuery.isError,
    companyQuery.error,
    subQuery.isError,
    subQuery.error,
    walletQuery.isError,
    walletQuery.error,
    txQuery.isError,
    txQuery.error,
    usersQuery.isError,
    usersQuery.error,
    handleRequestError,
  ]);

  return {
    tab,
    setTab,
    company: companyQuery.data ?? null,
    isLoading: companyQuery.isLoading,
    subscription: subQuery.data ?? null,
    wallet: walletQuery.data ?? null,
    transactions: txQuery.data ?? [],
    users: usersQuery.data ?? [],
  };
}
