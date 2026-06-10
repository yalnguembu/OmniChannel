import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  postApiCompanySearchOptions,
  postApiCompanySearchQueryKey,
  postApiCompanyMutation,
  getApiCountryDropdownOptions,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import type {
  CreateCompanyRequest,
  SearchCompanyRequest,
  SearchCompanyResponse,
} from "@/shared/api/generated/types.gen";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";
import { useDebounce } from "@/shared/hooks/useDebounce";

const PAGE_SIZE = 12;
export type CompanyView = "card" | "table";

export const FILTER_TABS = [
  { id: "all", label: "Toutes" },
  { id: "active", label: "Actives" },
  { id: "pending", label: "En attente" },
  { id: "suspended", label: "Suspendues" },
];

/**
 * ViewModel for the admin Companies page (read-only).
 * Uses the generated TanStack Query helpers (react-query.gen) directly and
 * exposes a flat surface (data + handlers) consumed by a dumb page component.
 */
export function useAdminCompaniesViewModel() {
  const queryClient = useQueryClient();
  const { handleRequestError, createMutationErrorHandler } = useErrorHandling();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [view, setView] = useState<CompanyView>("card");
  const [isFormOpen, setIsFormOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const query = useQuery({
    ...postApiCompanySearchOptions({
      body: {
        pageNumber: page,
        pageSize: PAGE_SIZE,
        searchTerm: debouncedSearch || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      } satisfies SearchCompanyRequest,
    }),
    select: (res: any) => ({
      items: (res?.data?.items ?? []) as SearchCompanyResponse[],
      total: (res?.data?.totalCount ?? 0) as number,
    }),
  });

  useEffect(() => {
    if (query.isError && query.error) handleRequestError(query.error);
  }, [query.isError, query.error, handleRequestError]);

  const companies = query.data?.items ?? [];
  const total = query.data?.total ?? 0;

  // Countries dropdown — needed to set `countryId` on creation.
  const countriesQuery = useQuery({
    ...getApiCountryDropdownOptions(),
    select: (res: any) =>
      (res?.data ?? []).map((c: any) => ({
        id: c.id ?? "",
        name: c.name ?? "",
      })),
  });
  const countries = countriesQuery.data ?? [];

  // --- Create modal ---
  const handleCloseForm = useCallback(() => setIsFormOpen(false), []);
  const handleOpenCreate = useCallback(() => setIsFormOpen(true), []);

  const createMutation = useMutation({
    ...postApiCompanyMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: postApiCompanySearchQueryKey(),
      });
      handleCloseForm();
      toast.success("Company créée");
    },
    onError: createMutationErrorHandler(),
  });

  const handleSubmit = useCallback(
    (data: CreateCompanyRequest) => {
      createMutation.mutate({ body: data });
    },
    [createMutation],
  );

  return {
    companies,
    total,
    isLoading: query.isLoading,
    countries,

    // create modal
    isFormOpen,
    isActionPending: createMutation.isPending,
    handleOpenCreate,
    handleCloseForm,
    handleSubmit,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    pageSize: PAGE_SIZE,
    view,
    setView,
    filterTabs: FILTER_TABS,
  };
}
