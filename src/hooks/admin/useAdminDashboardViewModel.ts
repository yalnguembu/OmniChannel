import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  postApiCompanySearchOptions,
  postApiUserSearchOptions,
  postApiMessageSearchOptions,
  postApiInvoiceSearchOptions,
  postApiProviderSearchOptions,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import type {
  SearchCompanyResponse,
  InvoiceDto,
  ProviderDto,
} from "@/shared/api/generated/types.gen";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";

/**
 * ViewModel for the admin Dashboard page.
 * Runs the five read queries (companies, users, messages, invoices, providers)
 * via the generated TanStack Query helpers and exposes a flat surface of
 * computed KPIs + lists consumed by a dumb page component.
 */
export function useAdminDashboardViewModel() {
  const { handleRequestError } = useErrorHandling();

  const companiesQuery = useQuery({
    ...postApiCompanySearchOptions({
      body: { pageNumber: 1, pageSize: 8 } as any,
    }),
    select: (res: any) => ({
      items: (res?.data?.items ?? []) as SearchCompanyResponse[],
      total: (res?.data?.totalCount ?? 0) as number,
    }),
  });

  // Active companies — real count via a filtered probe. The list above is only
  // the recent page (8), so counting its items would under-report the platform.
  const activeCompaniesQuery = useQuery({
    ...postApiCompanySearchOptions({
      body: { pageNumber: 1, pageSize: 1, status: "active" } as any,
    }),
    select: (res: any) => ({ total: (res?.data?.totalCount ?? 0) as number }),
  });

  const usersQuery = useQuery({
    ...postApiUserSearchOptions({
      body: { pageNumber: 1, pageSize: 1 } as any,
    }),
    select: (res: any) => ({
      total: (res?.data?.totalCount ?? 0) as number,
    }),
  });

  const messagesQuery = useQuery({
    ...postApiMessageSearchOptions({
      body: { pageNumber: 1, pageSize: 1 } as any,
    }),
    select: (res: any) => ({
      total: (res?.data?.totalCount ?? 0) as number,
    }),
  });

  const invoicesQuery = useQuery({
    ...postApiInvoiceSearchOptions({
      // Larger page so the outstanding-amount sum is accurate (no aggregate
      // endpoint exists); the card still renders only the first few.
      body: { pageNumber: 1, pageSize: 100, status: "pending" } as any,
    }),
    select: (res: any) => ({
      items: (res?.data?.items ?? []) as InvoiceDto[],
      total: (res?.data?.totalCount ?? 0) as number,
    }),
  });

  const providersQuery = useQuery({
    ...postApiProviderSearchOptions({
      body: { pageNumber: 1, pageSize: 100 } as any,
    }),
    select: (res: any) => ({
      items: (res?.data?.items ?? []) as ProviderDto[],
      total: (res?.data?.totalCount ?? 0) as number,
    }),
  });

  useEffect(() => {
    if (companiesQuery.isError && companiesQuery.error)
      handleRequestError(companiesQuery.error);
  }, [companiesQuery.isError, companiesQuery.error, handleRequestError]);

  useEffect(() => {
    if (activeCompaniesQuery.isError && activeCompaniesQuery.error)
      handleRequestError(activeCompaniesQuery.error);
  }, [
    activeCompaniesQuery.isError,
    activeCompaniesQuery.error,
    handleRequestError,
  ]);

  useEffect(() => {
    if (usersQuery.isError && usersQuery.error)
      handleRequestError(usersQuery.error);
  }, [usersQuery.isError, usersQuery.error, handleRequestError]);

  useEffect(() => {
    if (messagesQuery.isError && messagesQuery.error)
      handleRequestError(messagesQuery.error);
  }, [messagesQuery.isError, messagesQuery.error, handleRequestError]);

  useEffect(() => {
    if (invoicesQuery.isError && invoicesQuery.error)
      handleRequestError(invoicesQuery.error);
  }, [invoicesQuery.isError, invoicesQuery.error, handleRequestError]);

  useEffect(() => {
    if (providersQuery.isError && providersQuery.error)
      handleRequestError(providersQuery.error);
  }, [providersQuery.isError, providersQuery.error, handleRequestError]);

  const companies = companiesQuery.data?.items ?? [];
  const companiesCount = companiesQuery.data?.total ?? 0;
  const activeCompanies = activeCompaniesQuery.data?.total ?? 0;
  const totalMessages = messagesQuery.data?.total ?? 0;
  const totalUsers = usersQuery.data?.total ?? 0;
  const pendingInvoices = invoicesQuery.data?.items ?? [];
  const pendingInvoicesCount = invoicesQuery.data?.total ?? 0;
  const providers = providersQuery.data?.items ?? [];

  const activeProviders = providers.filter((p) => p.isActive).length;
  const pendingInvoiceAmount = pendingInvoices.reduce(
    (s, i) => s + (i.total ?? 0),
    0,
  );

  return {
    isLoading: companiesQuery.isLoading,
    companies,
    totalMessages,
    totalUsers,
    pendingInvoices,
    pendingInvoicesCount,
    activeProviders,
    activeCompanies,
    companiesCount,
    pendingInvoiceAmount,
  };
}
