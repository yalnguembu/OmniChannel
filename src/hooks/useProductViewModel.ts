import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  postApiProductSearchOptions,
  postApiProductMutation,
  putApiProductMutation,
  deleteApiProductByIdMutation,
  postApiProductSearchQueryKey,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import { mapToProductModels, type ProductModel } from "@/models/product.model";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";
import { useDebounce } from "@/shared/hooks/useDebounce";
import type { ProductDto } from "@/shared/api/generated/types.gen";

export type ProductFilterType = "all" | "active" | "paused" | "draft";
export type ProductSortBy = "createdAt" | "name" | "updatedAt";
export type ProductSortDirection = "asc" | "desc";

const PAGE_SIZE = 12;

export function useProductViewModel() {
  const queryClient = useQueryClient();
  const { handleRequestError, createMutationErrorHandler } = useErrorHandling();

  // ── UI state ──────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ProductFilterType>("all");
  const [sortBy, setSortBy] = useState<ProductSortBy>("createdAt");
  const [sortDirection, setSortDirection] = useState<ProductSortDirection>("desc");
  const [page, setPage] = useState(1);

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductModel | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductModel | null>(null);

  // ── Debounce search ───────────────────────────────────────────────────────
  const debouncedSearch = useDebounce(search, 400);

  // Reset to page 1 when filters / sort / search change
  useEffect(() => { setPage(1); }, [debouncedSearch, filter, sortBy, sortDirection]);

  // ── Main (filtered) query ─────────────────────────────────────────────────
  const mainQuery = useQuery({
    ...postApiProductSearchOptions({
      body: {
        pageNumber: page,
        pageSize: PAGE_SIZE,
        searchTerm: debouncedSearch || null,
        status: filter === "all" ? null : filter,
        sortBy,
        sortDirection,
      },
    }),
    select: (res) => ({
      items: mapToProductModels(res?.data?.items || []),
      totalCount: res?.data?.totalCount ?? 0,
      totalPages: res?.data?.totalPages ?? 1,
      pageNumber: res?.data?.pageNumber ?? 1,
      hasNextPage: res?.data?.hasNextPage ?? false,
      hasPreviousPage: res?.data?.hasPreviousPage ?? false,
    }),
  });

  // ── Counts query (always unfiltered, pageSize=1 — we just need totalCount) ─
  // We fire 4 queries: all, active, paused, draft to get accurate counts.
  const countAll = useQuery({
    ...postApiProductSearchOptions({ body: { pageSize: 1, pageNumber: 1 } }),
    select: (res) => res?.data?.totalCount ?? 0,
  });
  const countActive = useQuery({
    ...postApiProductSearchOptions({ body: { pageSize: 1, pageNumber: 1, status: "active" } }),
    select: (res) => res?.data?.totalCount ?? 0,
  });
  const countPaused = useQuery({
    ...postApiProductSearchOptions({ body: { pageSize: 1, pageNumber: 1, status: "paused" } }),
    select: (res) => res?.data?.totalCount ?? 0,
  });
  const countDraft = useQuery({
    ...postApiProductSearchOptions({ body: { pageSize: 1, pageNumber: 1, status: "draft" } }),
    select: (res) => res?.data?.totalCount ?? 0,
  });

  useEffect(() => {
    if (mainQuery.isError && mainQuery.error) handleRequestError(mainQuery.error);
  }, [mainQuery.isError, mainQuery.error, handleRequestError]);

  // ── Mutations ─────────────────────────────────────────────────────────────
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: postApiProductSearchQueryKey() });
  };

  const createMutation = useMutation({
    ...postApiProductMutation(),
    onSuccess: () => { invalidateAll(); setIsWizardOpen(false); toast.success("Produit créé avec succès"); },
    onError: createMutationErrorHandler(),
  });

  const updateMutation = useMutation({
    ...putApiProductMutation(),
    onSuccess: () => { invalidateAll(); setIsWizardOpen(false); setEditingProduct(null); toast.success("Produit mis à jour"); },
    onError: createMutationErrorHandler(),
  });

  const deleteMutation = useMutation({
    ...deleteApiProductByIdMutation(),
    onSuccess: () => { invalidateAll(); setDeleteTarget(null); toast.success("Produit supprimé"); },
    onError: createMutationErrorHandler(),
  });

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleOpenCreate = useCallback(() => { setEditingProduct(null); setIsWizardOpen(true); }, []);
  const handleOpenEdit   = useCallback((p: ProductModel) => { setEditingProduct(p); setIsWizardOpen(true); }, []);
  const handleCloseWizard = useCallback(() => { setIsWizardOpen(false); setEditingProduct(null); }, []);

  const handleSubmit = useCallback(
    (data: any) => {
      const companyId = data.companyId || editingProduct?.companyId || "019b99fe-5808-76dd-9d67-ed89827e5fd6";
      if (editingProduct) {
        updateMutation.mutate({
          body: {
            id: editingProduct.id,
            companyId,
            name: data.name ?? editingProduct.name,
            description: data.description ?? editingProduct.description,
            status: data.status ?? editingProduct.status,
            clientAttributes: data.clientAttributes ?? editingProduct.clientAttributes,
            clientMappingConfiguration: data.clientMappingConfiguration ?? editingProduct.clientMappingConfiguration,
          },
        });
      } else {
        createMutation.mutate({ body: { ...data, companyId } });
      }
    },
    [editingProduct, updateMutation, createMutation],
  );

  // ── Sort helper ───────────────────────────────────────────────────────────
  /**
   * Called from the sort select in the UI.
   * Format: "<field>:<direction>"  e.g. "name:asc"
   */
  const handleSortChange = useCallback((value: string) => {
    const [field, dir] = value.split(":");
    setSortBy(field as ProductSortBy);
    setSortDirection((dir as ProductSortDirection) ?? "desc");
  }, []);

  const currentSortValue = `${sortBy}:${sortDirection}`;

  return {
    // Data
    products: mainQuery.data?.items ?? [],
    isLoading: mainQuery.isLoading || mainQuery.isFetching,

    // Pagination
    page,
    pageSize: PAGE_SIZE,
    totalCount: mainQuery.data?.totalCount ?? 0,
    totalPages: mainQuery.data?.totalPages ?? 1,
    hasNextPage: mainQuery.data?.hasNextPage ?? false,
    hasPreviousPage: mainQuery.data?.hasPreviousPage ?? false,
    setPage,

    // Filter counts (global, not affected by current filters)
    counts: {
      all:    countAll.data    ?? 0,
      active: countActive.data ?? 0,
      paused: countPaused.data ?? 0,
      draft:  countDraft.data  ?? 0,
    },

    // Filters & sort
    search,
    filter,
    sortBy,
    sortDirection,
    currentSortValue,
    setSearch,
    setFilter,
    handleSortChange,

    // Action state
    isActionPending: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,

    // UI state
    isWizardOpen,
    editingProduct,
    deleteTarget,

    // Handlers
    handleOpenCreate,
    handleOpenEdit,
    handleCloseWizard,
    setDeleteTarget,
    handleDelete: () => deleteTarget && deleteMutation.mutate({ path: { id: deleteTarget.id } }),
    handleSubmit,
  };
}
