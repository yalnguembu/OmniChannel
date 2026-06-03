import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  postApiUserSearchOptions,
  postApiUserSearchQueryKey,
  getApiUserGetAllTypeOptions,
  getApiUserGetAllStatusOptions,
  postApiUserCompanyUsersMutation,
  postApiUserSystemUsersMutation,
  putApiUserByIdStatusMutation,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import type {
  UserDto,
  UserType,
  UserStatus,
} from "@/shared/api/generated/types.gen";
import { useAuthStore } from "@/store/authStore";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";

export type UserScope = "company" | "system";
const PAGE_SIZE = 20;

export interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  profileId?: string;
  userType?: string;
}

/**
 * Scope-aware user management ViewModel.
 * - scope="company" → lists/creates company users (postApiUserCompanyUsers)
 * - scope="system"  → lists/creates system users  (postApiUserSystemUsers)
 * Status/type dropdowns are driven by the get-all-status / get-all-type enums.
 */
export function useUsersViewModel(
  scope: UserScope,
  options?: { companyId?: string },
) {
  const queryClient = useQueryClient();
  const { handleRequestError, createMutationErrorHandler } = useErrorHandling();
  const authCompanyId = useAuthStore((s) => s.user?.companyId);
  // When an explicit companyId is given (admin viewing a company), scope to it;
  // otherwise fall back to the logged-in user's own company (portal).
  const targetCompanyId = options?.companyId ?? authCompanyId ?? undefined;

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState<UserDto | null>(null);

  const usersQuery = useQuery({
    ...postApiUserSearchOptions({
      body: {
        pageNumber: page,
        pageSize: PAGE_SIZE,
        searchTerm: search || undefined,
        userType: scope,
        companyId: targetCompanyId,
      } as any,
    }),
    select: (res: any) => ({
      items: (res?.data?.items ?? []) as UserDto[],
      total: (res?.data?.totalCount ?? 0) as number,
    }),
  });

  useEffect(() => {
    if (usersQuery.isError && usersQuery.error)
      handleRequestError(usersQuery.error);
  }, [usersQuery.isError, usersQuery.error, handleRequestError]);

  // Enum dropdowns
  const typesQuery = useQuery({
    ...getApiUserGetAllTypeOptions(),
    select: (res: any) => (res?.data ?? []) as UserType[],
  });
  const statusesQuery = useQuery({
    ...getApiUserGetAllStatusOptions(),
    select: (res: any) => (res?.data ?? []) as UserStatus[],
  });

  // Types relevant to the current scope (company-bound vs system).
  const types = (typesQuery.data ?? []).filter((t) =>
    scope === "company" ? t.requiresCompanyId : !t.requiresCompanyId,
  );

  const invalidate = useCallback(
    () =>
      queryClient.invalidateQueries({ queryKey: postApiUserSearchQueryKey() }),
    [queryClient],
  );

  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const createCompanyMutation = useMutation({
    ...postApiUserCompanyUsersMutation(),
    onSuccess: () => {
      invalidate();
      closeModal();
      toast.success("Utilisateur invité");
    },
    onError: createMutationErrorHandler(),
  });

  const createSystemMutation = useMutation({
    ...postApiUserSystemUsersMutation(),
    onSuccess: () => {
      invalidate();
      closeModal();
      toast.success("Utilisateur système créé");
    },
    onError: createMutationErrorHandler(),
  });

  const statusMutation = useMutation({
    ...putApiUserByIdStatusMutation(),
    onSuccess: () => {
      invalidate();
      setStatusTarget(null);
      toast.success("Statut mis à jour");
    },
    onError: createMutationErrorHandler(),
  });

  const handleCreate = useCallback(
    (data: UserFormData) => {
      if (scope === "company") {
        createCompanyMutation.mutate({
          body: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phoneNumber: data.phoneNumber,
            profileId: data.profileId,
            userType: data.userType ?? "company",
            companyId: targetCompanyId,
            forcePasswordChange: true,
          } as any,
        });
      } else {
        createSystemMutation.mutate({
          body: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phoneNumber: data.phoneNumber,
            profileId: data.profileId,
            forcePasswordChange: true,
          } as any,
        });
      }
    },
    [scope, targetCompanyId, createCompanyMutation, createSystemMutation],
  );

  const handleChangeStatus = useCallback(
    (id: string, newStatus: string, reason?: string) => {
      statusMutation.mutate({ path: { id }, body: { newStatus, reason } });
    },
    [statusMutation],
  );

  return {
    scope,
    users: usersQuery.data?.items ?? [],
    total: usersQuery.data?.total ?? 0,
    isLoading: usersQuery.isLoading,
    types,
    statuses: statusesQuery.data ?? [],
    page,
    setPage,
    pageSize: PAGE_SIZE,
    search,
    setSearch,
    isModalOpen,
    setIsModalOpen,
    statusTarget,
    setStatusTarget,
    handleCreate,
    handleChangeStatus,
    isActionPending:
      createCompanyMutation.isPending ||
      createSystemMutation.isPending ||
      statusMutation.isPending,
  };
}
