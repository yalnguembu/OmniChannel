import { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getApiProductDropdownOptions,
  postApiClientSearchOptions,
  postApiClientSegmentSearchOptions,
  postApiClientMutation,
  putApiClientMutation,
  deleteApiClientByIdMutation,
  postApiClientSearchQueryKey,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import {
  mapToClientModels,
  mapToSegmentModels,
  type ClientModel,
} from "@/models/client.model";
import type {
  CreateClientRequest,
  UpdateClientRequest,
  SearchClientResponse,
  SearchClientSegmentResponse,
} from "@/shared/api/generated/types.gen";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";

/**
 * ViewModel for the global Contacts/Clients list.
 */
export function useContactViewModel() {
  const queryClient = useQueryClient();
  const { handleRequestError, createMutationErrorHandler } = useErrorHandling();

  // --- State ---
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [segmentId, setSegmentId] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [productId, setProductId] = useState("all");

  // UI state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isSegmentsOpen, setIsSegmentsOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ClientModel | null>(null);
  
  // Detail Panel
  const [activeContact, setActiveContact] = useState<ClientModel | null>(null);
  const [detailTab, setDetailTab] = useState("profile"); // profile, channels, messages, segments

  // Advanced Filters
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [sort, setSort] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [advancedFilterSegment, setAdvancedFilterSegment] = useState("");

  // --- Queries ---

  const contactsQuery = useQuery({
    ...postApiClientSearchOptions({
      body: {
        productId: productId !== "all" ? productId : undefined,
        pageNumber: page,
        pageSize,
        searchTerm: search || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        segmentIds: segmentId !== "all" ? [segmentId] : undefined,
        sortBy: sort || undefined,
        sortDirection: sortOrder || undefined,
        // NOTE: segmentIds n'est pas typé sur SearchClientRequest (cast volontaire)
      } as any,
    }),
    select: (res) => {
      const rawItems = (res?.data?.items ||
        (Array.isArray(res?.data) ? res.data : [])) as SearchClientResponse[];
      const items = mapToClientModels(rawItems);
      const totalCount =
        (res?.metadata?.totalCount as number | undefined) ||
        (res?.data?.totalCount ?? items.length);

      return { items, totalCount };
    },
  });

  useEffect(() => {
    if (contactsQuery.isError && contactsQuery.error) {
      handleRequestError(contactsQuery.error);
    }
  }, [contactsQuery.isError, contactsQuery.error, handleRequestError]);

  const contacts = contactsQuery.data?.items || [];
  const totalCount = contactsQuery.data?.totalCount || 0;

  // --- Derived State (Counting by status for the whole list) ---
  const counts = useMemo(
    () => ({
      all: totalCount,
      active: contacts.filter((c: ClientModel) => c.status === "active").length,
      inactive: contacts.filter((c: ClientModel) => c.status === "inactive")
        .length,
      blocked: contacts.filter((c: ClientModel) => c.status === "blocked")
        .length,
    }),
    [contacts, totalCount],
  );

  const productsQuery = useQuery({
    ...getApiProductDropdownOptions(),
    select: (res: any) => (res?.data ?? []) as { id: string; name: string }[],
  });
  const products = productsQuery.data ?? [];

  const segmentsQuery = useQuery({
    ...postApiClientSegmentSearchOptions({
      body: {
        productId: productId !== "all" ? productId : undefined,
        pageNumber: 1,
        pageSize: 100,
      },
    }),
    select: (res) => {
      const items = (
        Array.isArray(res?.data?.items)
          ? res.data.items
          : Array.isArray(res?.data)
            ? res.data
            : []
      ) as SearchClientSegmentResponse[];
      return mapToSegmentModels(items);
    },
  });

  // --- Mutations ---
  const createMutation = useMutation({
    ...postApiClientMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: postApiClientSearchQueryKey(),
      });
      setIsModalOpen(false);
      toast.success("Contact créé");
    },
    onError: createMutationErrorHandler(),
  });

  const updateMutation = useMutation({
    ...putApiClientMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: postApiClientSearchQueryKey(),
      });
      setIsModalOpen(false);
      setEditingContact(null);
      toast.success("Contact mis à jour");
    },
    onError: createMutationErrorHandler(),
  });

  const deleteMutation = useMutation({
    ...deleteApiClientByIdMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: postApiClientSearchQueryKey(),
      });
      toast.success("Contact supprimé");
    },
    onError: createMutationErrorHandler(),
  });

  // --- Handlers ---
  const handleSearch = useCallback((val: string) => {
    setSearch(val);
    setPage(1);
  }, []);

  const handleSubmit = useCallback(
    (data: CreateClientRequest) => {
      if (editingContact) {
        // Explicit pick of UpdateClientRequest fields — no metadata / read-only DTOs
        const body: UpdateClientRequest = {
          id: editingContact.id,
          // NOTE: productId absent de ClientModel (non exposé par le mapper)
          productId: (editingContact as { productId?: string }).productId ?? undefined,
          externalId: data.externalId ?? editingContact.externalId ?? undefined,
          email: data.email ?? editingContact.email ?? undefined,
          phone: data.phone ?? editingContact.phone ?? undefined,
          firstName: data.firstName ?? editingContact.firstName ?? undefined,
          lastName: data.lastName ?? editingContact.lastName ?? undefined,
          gender: data.gender ?? editingContact.gender ?? undefined,
          birthDate: data.birthDate ?? undefined,
          language: data.language ?? undefined,
          timezone: data.timezone ?? undefined,
          address: data.address ?? undefined,
          city: data.city ?? undefined,
          postalCode: data.postalCode ?? undefined,
          country: data.country ?? undefined,
          status: data.status ?? editingContact.status ?? undefined,
          customData: data.customData ?? undefined,
        };
        updateMutation.mutate({ body });
      } else {
        createMutation.mutate({ body: data });
      }
    },
    [editingContact, updateMutation, createMutation],
  );

  return {
    contacts: contactsQuery.data?.items || [],
    totalCount: contactsQuery.data?.totalCount || 0,
    segments: segmentsQuery.data || [],
    products,
    isLoading: contactsQuery.isLoading,
    isActionPending:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,

    // UI state
    search,
    statusFilter,
    segmentId,
    productId,
    page,
    pageSize,
    counts,
    isModalOpen,
    isImportOpen,
    isSegmentsOpen,
    editingContact,
    activeContact,
    detailTab,
    isFilterModalOpen,
    sort,
    sortOrder,
    advancedFilterSegment,

    // Handlers
    setSearch: handleSearch,
    setStatusFilter: (v: string) => {
      setStatusFilter(v);
      setPage(1);
    },
    setSegmentId: (v: string) => {
      setSegmentId(v);
      setPage(1);
    },
    setProductId: (v: string) => {
      setProductId(v);
      setSegmentId("all"); // segments are product-scoped — reset on product change
      setPage(1);
    },
    setPage,
    setIsModalOpen,
    setIsImportOpen,
    setIsSegmentsOpen,
    setEditingContact,
    setActiveContact,
    setDetailTab,
    setIsFilterModalOpen,
    setSort: (v: string) => {
      setSort(v);
      setPage(1);
    },
    setSortOrder: (v: string) => {
      setSortOrder(v);
      setPage(1);
    },
    setPageSize: (v: number) => {
      setPageSize(v);
      setPage(1);
    },
    setAdvancedFilterSegment,
    handleSubmit,
    handleEdit: (c: ClientModel) => {
      setEditingContact(c);
      setIsModalOpen(true);
    },
    handleDelete: (id: string) => deleteMutation.mutate({ path: { id } }),
  };
}
