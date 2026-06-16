import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  getApiUserMeOptions,
  postApiAuthLogoutMutation,
  postApiAuthLogoutAllMutation,
} from "@/shared/api/generated/@tanstack/react-query.gen";
import { useAuthStore } from "@/store/authStore";

/**
 * Session hook: bootstraps the authenticated user (with permissions) via
 * /api/User/me into the auth store, and exposes server-backed logout actions.
 */
export function useSession() {
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);

  const meQuery = useQuery({
    ...getApiUserMeOptions(),
    // Auth is cookie-based (withCredentials); run as soon as the session is
    // authenticated even if the access token wasn't persisted. This is what
    // enriches the slim login user with companyName / profile / permissions.
    enabled: !!token || isAuthenticated,
    refetchOnMount: "always",
    select: (res: any) => res?.data ?? null,
  });

  // Sync the resolved /me payload (incl. permissions) into the store.
  useEffect(() => {
    const u = meQuery.data;
    if (!u) return;
    setUser({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      userType: u.userType,
      status: u.status,
      companyId: u.companyId,
      companyName: u.companyName,
      profileId: u.profileId,
      profileName: u.profileName,
      permissions: u.permissions ?? [],
    });
  }, [meQuery.data, setUser]);

  const endSession = () => {
    logout();
    navigate({ to: "/login" });
  };

  const logoutMutation = useMutation({
    ...postApiAuthLogoutMutation(),
    onSettled: endSession,
  });
  const logoutAllMutation = useMutation({
    ...postApiAuthLogoutAllMutation(),
    onSettled: endSession,
  });

  return {
    user,
    permissions: user?.permissions ?? [],
    isLoadingMe: meQuery.isLoading,
    logout: () => logoutMutation.mutate({}),
    logoutAll: () => logoutAllMutation.mutate({}),
    isLoggingOut: logoutMutation.isPending || logoutAllMutation.isPending,
  };
}
