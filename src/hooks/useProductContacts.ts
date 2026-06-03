import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  postApiClientSegmentMemberSearchOptions,
  postApiClientSearchOptions,
  postApiClientSegmentSearchOptions,
  getApiProductDetailByIdOptions,
  postApiClientMutation,
  putApiClientMutation,
  putApiProductMutation,
  deleteApiClientByIdMutation,
  postApiClientSearchQueryKey,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import {
  mapToClientModels,
  mapToSegmentModels,
  type ClientModel,
} from "@/models/client.model";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";

/**
 * ViewModel for the Contacts tab of a specific product.
 * Handles both the contacts list and the product-level configurations (attributes/mapping).
 */
export function useProductContacts(productId: string) {
  const queryClient = useQueryClient();
  const { handleRequestError, createMutationErrorHandler } = useErrorHandling();

  // --- UI State ---
  const [activeSubTab, setActiveSubTab] = useState<"list" | "configs">("list");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [segmentId, setSegmentId] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isSegmentsOpen, setIsSegmentsOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ClientModel | null>(
    null,
  );

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
    select: (res) => {
      const data = res?.data as any;
      const items: ClientModel[] = (data?.items || []).map((m: any) => ({
        id: m.clientId || m.id,
        firstName: m.clientFirstName || "",
        lastName: m.clientLastName || "",
        email: m.clientEmail || null,
        phone: "", // Not provided in segment member search
        status: (m.clientStatus || "active").toLowerCase() as any,
        createdAt: m.createdAt || "",
        updatedAt: m.createdAt || "",
        metadata: {},
      }));

      return {
        items,
        totalCount: data?.totalCount || 0,
      };
    },
    enabled: !!productId && activeSubTab === "list" && isSegmentFilter,
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
      } as any,
    }),
    select: (res) => ({
      items: mapToClientModels(res?.data?.items || []),
      totalCount: res?.data?.totalCount || 0,
    }),
    enabled: !!productId && activeSubTab === "list" && !isSegmentFilter,
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
    select: (res) => mapToSegmentModels(res?.data?.items || []),
    enabled: !!productId,
  });

  // 3. Product Configs (Attributes/Mapping)
  const productQuery = useQuery({
    ...getApiProductDetailByIdOptions({
      path: { id: productId },
    }),
    select: (res) => res?.data, // We just need the raw data for editing
    enabled: !!productId && activeSubTab === "configs",
  });

  const [configData, setConfigData] = useState<{
    clientAttributes: any[];
    clientMappingConfiguration: Record<string, string>;
  } | null>(null);

  useEffect(() => {
    if (productQuery.data) {
      const p = productQuery.data as any;
      setConfigData({
        clientAttributes: JSON.parse(p.clientAttributes || "[]"),
        clientMappingConfiguration: JSON.parse(
          p.clientMappingConfiguration || "{}",
        ),
      });
    }
  }, [productQuery.data]);

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

  const saveConfigsMutation = useMutation({
    ...putApiProductMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getApiProductDetailById"], // We don't have the exact key generator here easily, but we can just use the base key
      });
      toast.success("Configurations enregistrées");
    },
    onError: createMutationErrorHandler({
      toastMessage: "Erreur lors de l'enregistrement",
    }),
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
    (data: any) => {
      if (editingContact) {
        // Explicit pick of UpdateClientRequest fields only
        updateMutation.mutate({
          body: {
            id: editingContact.id,
            productId: (editingContact as any).productId ?? productId,
            externalId: data.externalId ?? (editingContact as any).externalId,
            email: data.email ?? editingContact.email,
            phone: data.phone ?? editingContact.phone,
            firstName: data.firstName ?? editingContact.firstName,
            lastName: data.lastName ?? editingContact.lastName,
            gender: data.gender ?? (editingContact as any).gender,
            birthDate: data.birthDate ?? undefined,
            language: data.language ?? undefined,
            timezone: data.timezone ?? undefined,
            address: data.address ?? undefined,
            city: data.city ?? undefined,
            postalCode: data.postalCode ?? undefined,
            country: data.country ?? undefined,
            status: data.status ?? editingContact.status,
            customData: data.customData ?? undefined,
          } as any,
        });
      } else {
        createMutation.mutate({ body: { ...data, productId } });
      }
    },
    [editingContact, updateMutation, createMutation, productId],
  );

  const handleSaveConfigs = useCallback(() => {
    if (configData && productQuery.data) {
      const p = productQuery.data as any;
      // Explicit pick of UpdateProductRequest fields — no read-only/audit columns
      saveConfigsMutation.mutate({
        body: {
          id: p.id,
          companyId: p.companyId,
          name: p.name,
          description: p.description,
          status: p.status,
          settings: p.settings,
          clientAttributes: JSON.stringify(configData.clientAttributes),
          clientMappingConfiguration: JSON.stringify(
            configData.clientMappingConfiguration,
          ),
        },
      });
    }
  }, [configData, productQuery.data, saveConfigsMutation]);

  return {
    // State
    activeSubTab,
    setActiveSubTab,
    contacts: activeContactsQuery.data?.items || [],
    totalCount: activeContactsQuery.data?.totalCount || 0,
    segments: segmentsQuery.data || [],
    search,
    statusFilter,
    segmentId,
    page,
    isLoading: activeContactsQuery.isLoading,
    isActionPending:
      createMutation.isPending ||
      updateMutation.isPending ||
      saveConfigsMutation.isPending,

    // Config state
    configData,
    setConfigData,

    // UI state
    isModalOpen,
    setIsModalOpen,
    isImportOpen,
    setIsImportOpen,
    isSegmentsOpen,
    setIsSegmentsOpen,
    editingContact,
    setEditingContact,

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
    setPage,
    handleSubmit,
    handleSaveConfigs,
    handleEdit: (c: ClientModel) => {
      setEditingContact(c);
      setIsModalOpen(true);
    },
    handleDelete: (id: string) => {
      if (window.confirm("Supprimer ce contact ?")) deleteMutation.mutate({ path: { id } });
    },
    handleView: (c: ClientModel) => {
      setEditingContact(c);
      setIsModalOpen(true);
    },
    handleImportSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: postApiClientSearchQueryKey(),
      });
      setIsImportOpen(false);
    },
  };
}
