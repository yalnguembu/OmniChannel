import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getApiCompanyDetailByIdOptions,
  getApiCompanyDetailByIdQueryKey,
  getApiCountryDropdownOptions,
  postApiSubscriptionSearchOptions,
  postApiWalletSearchOptions,
  postApiWalletTransactionSearchOptions,
  postApiUserSearchOptions,
  postApiCompanySearchQueryKey,
  putApiCompanyMutation,
  deleteApiCompanyByIdMutation,
  patchApiCompanyApiKeyRenegereByIdMutation,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import type {
  CompanyDto,
  CreateCompanyRequest,
  UpdateCompanyRequest,
  SearchSubscriptionResponse,
  SearchWalletResponse,
  SearchWalletTransactionResponse,
  SearchUserResponse,
} from "@/shared/api/generated/types.gen";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";

/**
 * ViewModel for the admin Company detail page (read-only).
 * Loads the company via the by-id endpoint and lazily loads each tab's data
 * (subscription / wallet / transactions / users) gated on the active tab.
 */
export function useAdminCompanyDetailViewModel(
  companyId: string,
  options?: { onDeleted?: () => void },
) {
  const queryClient = useQueryClient();
  const { handleRequestError, createMutationErrorHandler } = useErrorHandling();

  const [tab, setTab] = useState("info");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const companyQuery = useQuery({
    ...getApiCompanyDetailByIdOptions({ path: { id: companyId } }),
    select: (res: any) => res?.data as CompanyDto,
  });

  const subQuery = useQuery({
    ...postApiSubscriptionSearchOptions({
      body: { companyId, pageNumber: 1, pageSize: 1 },
    }),
    select: (res) =>
      (res?.data?.items?.[0] ?? null) as SearchSubscriptionResponse | null,
    enabled: tab === "subscription",
  });

  const walletQuery = useQuery({
    ...postApiWalletSearchOptions({
      body: { companyId, pageNumber: 1, pageSize: 1 },
    }),
    select: (res) =>
      (res?.data?.items?.[0] ?? null) as SearchWalletResponse | null,
    enabled: tab === "wallet",
  });

  const txQuery = useQuery({
    // NOTE: SearchWalletTransactionRequest n'expose pas `companyId` (filtre par
    // walletId) — cast conservé pour préserver le comportement existant.
    ...postApiWalletTransactionSearchOptions({
      body: { companyId, pageNumber: 1, pageSize: 20 } as any,
    }),
    select: (res) =>
      (res?.data?.items ?? []) as SearchWalletTransactionResponse[],
    enabled: tab === "wallet",
  });

  const usersQuery = useQuery({
    // NOTE: SearchUserRequest n'expose pas `companyId` — cast conservé.
    ...postApiUserSearchOptions({
      body: { companyId, pageNumber: 1, pageSize: 50 } as any,
    }),
    select: (res) => (res?.data?.items ?? []) as SearchUserResponse[],
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

  const company = companyQuery.data ?? null;

  // Countries dropdown — needed to populate the edit form's country Select.
  const countriesQuery = useQuery({
    ...getApiCountryDropdownOptions(),
    select: (res: any) =>
      (res?.data ?? []).map((c: any) => ({
        id: c.id ?? "",
        name: c.name ?? "",
      })),
  });
  const countries = countriesQuery.data ?? [];

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: getApiCompanyDetailByIdQueryKey({ path: { id: companyId } }),
    });
    queryClient.invalidateQueries({
      queryKey: postApiCompanySearchQueryKey(),
    });
  }, [queryClient, companyId]);

  // --- Edit (update) ---
  const handleOpenEdit = useCallback(() => setIsEditOpen(true), []);
  const handleCloseEdit = useCallback(() => setIsEditOpen(false), []);

  const updateMutation = useMutation({
    ...putApiCompanyMutation(),
    onSuccess: () => {
      invalidate();
      setIsEditOpen(false);
      toast.success("Company mise à jour");
    },
    onError: createMutationErrorHandler(),
  });

  const handleUpdate = useCallback(
    (data: CreateCompanyRequest) => {
      const body: UpdateCompanyRequest = { ...data, id: companyId };
      updateMutation.mutate({ body });
    },
    [updateMutation, companyId],
  );

  // Quick inline toggle of the sandbox flag from the detail view — resends the
  // full company as an UpdateCompanyRequest with only `isSandbox` flipped.
  const handleToggleSandbox = useCallback(
    (value: boolean) => {
      if (!company) return;
      const body: UpdateCompanyRequest = {
        id: companyId,
        name: company.name,
        legalName: company.legalName,
        taxNumber: company.taxNumber,
        countryId: company.countryId,
        status: company.status,
        email: company.email,
        phone: company.phone,
        website: company.website,
        address: company.address,
        city: company.city,
        postalCode: company.postalCode,
        country: company.country,
        billingMode: company.billingMode,
        timezone: company.timezone,
        defaultLanguage: company.defaultLanguage,
        isSandbox: value,
      };
      updateMutation.mutate({ body });
    },
    [company, companyId, updateMutation],
  );

  // --- Delete ---
  const handleOpenDelete = useCallback(() => setIsDeleteOpen(true), []);
  const handleCloseDelete = useCallback(() => setIsDeleteOpen(false), []);

  const deleteMutation = useMutation({
    ...deleteApiCompanyByIdMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: postApiCompanySearchQueryKey(),
      });
      setIsDeleteOpen(false);
      toast.success("Company supprimée");
      options?.onDeleted?.();
    },
    onError: createMutationErrorHandler(),
  });

  const handleConfirmDelete = useCallback(() => {
    deleteMutation.mutate({ path: { id: companyId } });
  }, [deleteMutation, companyId]);

  // --- Regenerate API key ---
  const regenerateMutation = useMutation({
    ...patchApiCompanyApiKeyRenegereByIdMutation(),
    onSuccess: async (res: any) => {
      const apiKey = res?.data?.apiKey as string | undefined;
      if (apiKey) {
        try {
          await navigator.clipboard.writeText(apiKey);
          toast.success("Clé API copiée dans le presse-papiers");
        } catch {
          // Clipboard refused (permissions/insecure context) — surface the key.
          toast.success(`Nouvelle clé API : ${apiKey}`);
        }
      } else {
        toast.success("Clé API régénérée");
      }
    },
    onError: createMutationErrorHandler(),
  });

  const handleRegenerateApiKey = useCallback(() => {
    regenerateMutation.mutate({ path: { id: companyId } });
  }, [regenerateMutation, companyId]);

  return {
    tab,
    setTab,
    company,
    isLoading: companyQuery.isLoading,
    subscription: subQuery.data ?? null,
    wallet: walletQuery.data ?? null,
    transactions: txQuery.data ?? [],
    users: usersQuery.data ?? [],

    // edit / delete / regenerate
    countries,
    isEditOpen,
    isUpdatePending: updateMutation.isPending,
    handleOpenEdit,
    handleCloseEdit,
    handleUpdate,
    handleToggleSandbox,
    isDeleteOpen,
    isDeletePending: deleteMutation.isPending,
    handleOpenDelete,
    handleCloseDelete,
    handleConfirmDelete,
    isRegeneratePending: regenerateMutation.isPending,
    handleRegenerateApiKey,
  };
}
