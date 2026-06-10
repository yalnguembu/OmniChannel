import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  postApiUserSearchOptions,
  postApiUserSearchQueryKey,
  getApiUserGetAllTypeOptions,
  getApiUserGetAllStatusOptions,
  getApiUserProfileDropdownOptions,
  getApiUserDetailByIdOptions,
  postApiUserCompanyUsersMutation,
  postApiUserSystemUsersMutation,
  putApiUserStatusByIdMutation,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import type {
  SearchUserResponse,
  UserType,
  UserStatus,
} from "@/shared/api/generated/types.gen";
import { useAuthStore } from "@/store/authStore";
import { useErrorHandling } from "@/shared/hooks/useErrorHandling";
import { USER_TYPE, isSystemUser } from "@/lib/auth";

export type UserScope = "company" | "system";
const PAGE_SIZE = 20;

export interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  profileId?: string;
  userType?: string;
  initialPassword?: string;
  forcePasswordChange?: boolean;
  /** Company scope only — initial account status. */
  initialStatus?: string;
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
  const [statusFilter, setStatusFilter] = useState("");
  const [profileFilter, setProfileFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState<SearchUserResponse | null>(
    null,
  );
  const [selectedUser, setSelectedUser] = useState<SearchUserResponse | null>(
    null,
  );

  // Reset to first page whenever a filter changes.
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, profileFilter]);

  const usersQuery = useQuery({
    ...postApiUserSearchOptions({
      body: {
        pageNumber: page,
        pageSize: PAGE_SIZE,
        searchTerm: search || undefined,
        userType: scope,
        companyId: targetCompanyId,
        status: statusFilter || undefined,
        profileId: profileFilter || undefined,
      },
    }),
    select: (res) => ({
      items: (res?.data?.items ?? []) as SearchUserResponse[],
      total: res?.data?.totalCount ?? 0,
    }),
  });

  useEffect(() => {
    if (usersQuery.isError && usersQuery.error)
      handleRequestError(usersQuery.error);
  }, [usersQuery.isError, usersQuery.error, handleRequestError]);

  // Enum dropdowns
  const typesQuery = useQuery({
    ...getApiUserGetAllTypeOptions(),
    select: (res) => (res?.data ?? []) as UserType[],
  });
  const statusesQuery = useQuery({
    ...getApiUserGetAllStatusOptions(),
    select: (res) => (res?.data ?? []) as UserStatus[],
  });
  const profilesQuery = useQuery({
    ...getApiUserProfileDropdownOptions(),
    select: (res: any) => (res?.data ?? []) as { id: string; name: string }[],
  });

  // User types offered for the current scope: company creation lists the
  // non-system types, system (admin) creation lists the system types.
  const types = (typesQuery.data ?? []).filter((t) =>
    scope === "company" ? !isSystemUser(t.code) : isSystemUser(t.code),
  );

  // Detail of the currently opened user (fresh fetch; falls back to the row).
  const detailQuery = useQuery({
    ...getApiUserDetailByIdOptions({ path: { id: selectedUser?.id ?? "" } }),
    select: (res: any) => res?.data as SearchUserResponse,
    enabled: !!selectedUser?.id,
  });

  const openDetail = useCallback(
    (user: SearchUserResponse) => setSelectedUser(user),
    [],
  );
  const closeDetail = useCallback(() => setSelectedUser(null), []);

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
    ...putApiUserStatusByIdMutation(),
    onSuccess: () => {
      invalidate();
      setStatusTarget(null);
      setSelectedUser(null);
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
            // userType choisi dans le form (types company filtrés), COMPANY_USER par défaut.
            userType: data.userType || USER_TYPE.COMPANY_USER,
            companyId: targetCompanyId,
            initialPassword: data.initialPassword || undefined,
            forcePasswordChange: data.forcePasswordChange ?? true,
            initialStatus: data.initialStatus || undefined,
          },
        });
      } else {
        // NOTE: CreateSystemUserRequest n'a ni userType, ni companyId, ni initialStatus.
        createSystemMutation.mutate({
          body: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phoneNumber: data.phoneNumber,
            profileId: data.profileId,
            initialPassword: data.initialPassword || undefined,
            forcePasswordChange: data.forcePasswordChange ?? true,
          },
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
    profiles: profilesQuery.data ?? [],
    page,
    setPage,
    pageSize: PAGE_SIZE,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    profileFilter,
    setProfileFilter,
    isModalOpen,
    setIsModalOpen,
    statusTarget,
    setStatusTarget,
    // user detail / profile
    selectedUser,
    detailUser: detailQuery.data ?? selectedUser,
    isDetailLoading: detailQuery.isLoading,
    openDetail,
    closeDetail,
    handleCreate,
    handleChangeStatus,
    isActionPending:
      createCompanyMutation.isPending ||
      createSystemMutation.isPending ||
      statusMutation.isPending,
  };
}
