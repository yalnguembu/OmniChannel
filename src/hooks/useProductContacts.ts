import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  postApiClientSegmentMemberSearchOptions,
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
  mapSegmentMembersToClients,
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
 * ViewModel for the Contacts tab of a specific product.
 * Handles both the contacts list and the product-level configurations (attributes/mapping).
 */
export function useProductContacts(productId: string) {
  const queryClient = useQueryClient();
  const { handleRequestError, createMutationErrorHandler } = useErrorHandling();

  // --- UI State ---
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [segmentId, setSegmentId] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [sort, setSort] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isSegmentsOpen, setIsSegmentsOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ClientModel | null>(
    null,
  );

  // Detail side panel (same as the global contacts list)
  const [activeContact, setActiveContact] = useState<ClientModel | null>(null);
  const [detailTab, setDetailTab] = useState("profile");

  // --- Data Fetching ---

  const isSegmentFilter = segmentId !== "all";

  // 1. Contacts List via Segment Member
  const segmentMembersQuery = useQuery({
    ...postApiClientSegmentMemberSearchOptions({
      body: {
        segmentId: segmentId,
        pageNumber: page,
        pageSize,
        searchTerm: search || undefined,
      },
    }),
    select: (res) => ({
      items: mapSegmentMembersToClients([...(res?.data?.items ?? [])]),
      totalCount: res?.data?.totalCount || 0,
    }),
    enabled: !!productId && isSegmentFilter,
  });

  // 1. Contacts List via Client
  const clientsQuery = useQuery({
    ...postApiClientSearchOptions({
      body: {
        productId,
        pageNumber: page,
        pageSize,
        searchTerm: search || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        sortBy: sort || undefined,
        sortDirection: sortOrder || undefined,
      } as any,
    }),
    select: (res) => ({
      items: mapToClientModels(
        (res?.data?.items || []) as SearchClientResponse[],
      ),
      totalCount: res?.data?.totalCount || 0,
    }),
    enabled: !!productId && !isSegmentFilter,
  });

  const activeContactsQuery = isSegmentFilter ? segmentMembersQuery : clientsQuery;

  useEffect(() => {
    if (activeContactsQuery.isError && activeContactsQuery.error) {
      handleRequestError(activeContactsQuery.error);
    }
  }, [activeContactsQuery.isError, activeContactsQuery.error, handleRequestError]);

  // 2. Segments List
  const segmentsQuery = useQuery({
    ...postApiClientSegmentSearchOptions({
      body: {
        productId,
        pageNumber: 1,
        pageSize: 100,
      },
    }),
    select: (res) =>
      mapToSegmentModels(
        (res?.data?.items || []) as SearchClientSegmentResponse[],
      ),
    enabled: !!productId,
  });

  // 3. Product Configs (Attributes/Mapping) — no longer fetched/edited here.
  // The attribute schema + import mapping moved to the dedicated SchemaTab, which
  // uses the attribute-schema / client-mapping sub-resources (see SchemaTab +
  // useProductAttributeSchema) instead of the legacy ProductDto JSON blob.

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
        // Explicit pick of UpdateClientRequest fields only
        const body: UpdateClientRequest = {
          id: editingContact.id,
          // NOTE: productId absent de ClientModel (non exposé par le mapper)
          productId:
            (editingContact as { productId?: string }).productId ?? productId,
          externalId: data.externalId ?? editingContact.externalId,
          email: data.email ?? editingContact.email,
          phone: data.phone ?? editingContact.phone,
          firstName: data.firstName ?? editingContact.firstName,
          lastName: data.lastName ?? editingContact.lastName,
          gender: data.gender ?? editingContact.gender,
          birthDate: data.birthDate ?? undefined,
          language: data.language ?? undefined,
          timezone: data.timezone ?? undefined,
          address: data.address ?? undefined,
          city: data.city ?? undefined,
          postalCode: data.postalCode ?? undefined,
          country: data.country ?? undefined,
          status: data.status ?? editingContact.status,
          customData: data.customData ?? undefined,
        };
        updateMutation.mutate({ body });
      } else {
        createMutation.mutate({ body: { ...data, productId } });
      }
    },
    [editingContact, updateMutation, createMutation, productId],
  );

  return {
    // State
    contacts: activeContactsQuery.data?.items || [],
    totalCount: activeContactsQuery.data?.totalCount || 0,
    segments: segmentsQuery.data || [],
    search,
    statusFilter,
    segmentId,
    page,
    pageSize,
    sort,
    sortOrder,
    isLoading: activeContactsQuery.isLoading,
    isActionPending: createMutation.isPending || updateMutation.isPending,

    // UI state
    isModalOpen,
    setIsModalOpen,
    isImportOpen,
    setIsImportOpen,
    isSegmentsOpen,
    setIsSegmentsOpen,
    editingContact,
    setEditingContact,
    activeContact,
    setActiveContact,
    detailTab,
    setDetailTab,

    // Handlers
    handleSearch,
    setStatusFilter: (v: string) => {
      setStatusFilter(v);
      setPage(1);
    },
    setSegmentId: (v: string) => {
      setSegmentId(v);
      setPage(1);
    },
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
    setPage,
    handleSubmit,
    handleEdit: (c: ClientModel) => {
      setEditingContact(c);
      setIsModalOpen(true);
    },
    handleDelete: (id: string) => {
      if (window.confirm("Supprimer ce contact ?")) deleteMutation.mutate({ path: { id } });
    },
    handleView: (c: ClientModel) => setActiveContact(c),
    handleImportSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: postApiClientSearchQueryKey(),
      });
      setIsImportOpen(false);
    },
  };
}
