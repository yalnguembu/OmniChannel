import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  postApiIntegrationSearchOptions,
  postApiIntegrationSearchQueryKey,
  postApiIntegrationMutation,
  putApiIntegrationMutation,
  putApiIntegrationConfigureMutation,
  deleteApiIntegrationByIdMutation,
  getApiCompanyDropdownOptions,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import type {
  CreateIntegrationRequest,
  UpdateIntegrationRequest,
  ConfigureIntegrationRequest,
  SearchIntegrationResponse,
} from "@/shared/api/generated/types.gen";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";
import { useDebounce } from "@/shared/hooks/useDebounce";

const PAGE_SIZE = 25;

/**
 * ViewModel for the admin Integrations page.
 *
 * - List: paginated search returning `SearchIntegrationResponse` (brut).
 * - Create / Edit: `CreateIntegrationRequest` / `UpdateIntegrationRequest`.
 * - Configure: `ConfigureIntegrationRequest` (baseUrl + auth + settings).
 */
export function useAdminIntegrationsViewModel() {
  const queryClient = useQueryClient();
  const { handleRequestError, createMutationErrorHandler } = useErrorHandling();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfigureOpen, setIsConfigureOpen] = useState(false);
  const [editingIntegration, setEditingIntegration] =
    useState<SearchIntegrationResponse | null>(null);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const query = useQuery({
    ...postApiIntegrationSearchOptions({
      body: {
        pageNumber: page,
        pageSize: PAGE_SIZE,
        searchTerm: debouncedSearch || undefined,
      },
    }),
    select: (res) => ({
      items: (res?.data?.items ?? []) as SearchIntegrationResponse[],
      total: res?.data?.totalCount ?? 0,
    }),
  });

  useEffect(() => {
    if (query.isError && query.error) handleRequestError(query.error);
  }, [query.isError, query.error, handleRequestError]);

  // Companies dropdown — needed to set `companyId` on creation.
  const companiesQuery = useQuery({
    ...getApiCompanyDropdownOptions(),
    select: (res) =>
      (res?.data ?? []).map((c) => ({
        id: c.id ?? "",
        name: c.name ?? "",
      })),
  });

  const companies = companiesQuery.data ?? [];

  const integrations = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const activeCount = integrations.filter((i) => i.isActive).length;

  const invalidate = useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: postApiIntegrationSearchQueryKey(),
      }),
    [queryClient],
  );

  // --- Form modal (create / edit) ---
  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingIntegration(null);
  }, []);

  const createMutation = useMutation({
    ...postApiIntegrationMutation(),
    onSuccess: () => {
      invalidate();
      handleCloseForm();
      toast.success("Intégration créée");
    },
    onError: createMutationErrorHandler(),
  });

  const updateMutation = useMutation({
    ...putApiIntegrationMutation(),
    onSuccess: () => {
      invalidate();
      handleCloseForm();
      toast.success("Intégration modifiée");
    },
    onError: createMutationErrorHandler(),
  });

  const handleOpenCreate = useCallback(() => {
    setEditingIntegration(null);
    setIsFormOpen(true);
  }, []);

  const handleOpenEdit = useCallback((integration: SearchIntegrationResponse) => {
    setEditingIntegration(integration);
    setIsFormOpen(true);
  }, []);

  const handleSubmit = useCallback(
    (data: CreateIntegrationRequest) => {
      if (editingIntegration) {
        const body: UpdateIntegrationRequest = {
          ...data,
          id: editingIntegration.id,
        };
        updateMutation.mutate({ body });
      } else {
        createMutation.mutate({ body: data });
      }
    },
    [editingIntegration, updateMutation, createMutation],
  );

  // --- Configure modal ---
  const handleCloseConfigure = useCallback(() => {
    setIsConfigureOpen(false);
    setEditingIntegration(null);
  }, []);

  const configureMutation = useMutation({
    ...putApiIntegrationConfigureMutation(),
    onSuccess: () => {
      invalidate();
      handleCloseConfigure();
      toast.success("Intégration configurée");
    },
    onError: createMutationErrorHandler(),
  });

  const handleOpenConfigure = useCallback(
    (integration: SearchIntegrationResponse) => {
      setEditingIntegration(integration);
      setIsConfigureOpen(true);
    },
    [],
  );

  const handleConfigureSubmit = useCallback(
    (data: ConfigureIntegrationRequest) => {
      configureMutation.mutate({ body: data });
    },
    [configureMutation],
  );

  // --- Delete ---
  const deleteMutation = useMutation({
    ...deleteApiIntegrationByIdMutation(),
    onSuccess: () => {
      invalidate();
      toast.success("Intégration supprimée");
    },
    onError: createMutationErrorHandler(),
  });

  const handleDelete = useCallback(
    (integration: SearchIntegrationResponse) => {
      if (!integration.id) return;
      deleteMutation.mutate({ path: { id: integration.id } });
    },
    [deleteMutation],
  );

  return {
    integrations,
    total,
    activeCount,
    isLoading: query.isLoading,
    search,
    setSearch,
    page,
    setPage,
    pageSize: PAGE_SIZE,
    companies,

    // form modal
    isFormOpen,
    editingIntegration,
    isActionPending: createMutation.isPending || updateMutation.isPending,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseForm,
    handleSubmit,

    // configure modal
    isConfigureOpen,
    isConfigurePending: configureMutation.isPending,
    handleOpenConfigure,
    handleCloseConfigure,
    handleConfigureSubmit,

    // delete
    handleDelete,
  };
}
