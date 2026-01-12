import { useCallback } from "react"
import { toast } from "sonner"
import { router } from "@/app/providers/router-provider"
import { useSessionStore } from "@/features/auth/stores/sessionStore"
import {
  postApiAuthLogoutAllMutation,
  postApiAuthLogoutMutation,
  postApiAuthCookieLoginMutation,
  getApiUserMeOptions,
  postApiAuthCookieLogoutMutation,
} from "@/shared/api/@tanstack/react-query.gen"
import { LoginRequest } from "../../../shared/api/types.gen"
import { authPersistence } from "../../../shared/lib/api/authPersistence"
import { USER_TYPE } from "../../../shared/enums/session"
import { UserSession } from "@/shared/types/session"
import { useMutation, useQuery } from "@tanstack/react-query"

export const useSession = () => {
  const sessionStore = useSessionStore()

  const getApiUserMe = () =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      ...getApiUserMeOptions(),
      staleTime: 5 * 60 * 1000,
      select: (data) => {
        if (data.success && data.data) {
          sessionStore.setUser({ ...data.data, fullName: `${data.data.firstName} ${data.data.lastName}` } as UserSession)
        }
        return data
      },
    })

  const loginMutation = useMutation({
    ...postApiAuthCookieLoginMutation(),
    onMutate: () => {
      sessionStore.setLoading(true)
      sessionStore.setError(null)
    },
    onSuccess: (response) => {
      if (response.data?.user) {
        sessionStore.setUser(response.data.user as UserSession)
        authPersistence.storeUserData(response.data.user as UserSession)
        authPersistence.storeUserType(response.data.user.userType as USER_TYPE)
      }

      toast.success("Successfully logged in")

      const returnUrl = new URL(window.location.href).searchParams.get("returnUrl") || "/dashboard"
      if (returnUrl) router.navigate({ to: returnUrl })
      else router.navigate({ to: "/" })
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.detail || error.message || "Login failed"
      sessionStore.setError(errorMessage)
      toast.error(errorMessage)
    },
    onSettled: () => {
      sessionStore.setLoading(false)
    },
  })

  const logoutMutation = useMutation({
    ...postApiAuthCookieLogoutMutation(),
    onMutate: () => {
      sessionStore.setLoading(true)
    },
    onError: (error) => {
      console.error("Logout error:", error)
    },
    onSettled: () => {
      sessionStore.resetSession()
      sessionStorage.clear()
      authPersistence.clearAuthData()
      router.navigate({ to: "/auth/login" })
      toast.info("You have been logged out")
      sessionStore.setLoading(false)
    },
  })

  const terminateSessionMutation = useMutation({
    ...postApiAuthLogoutMutation(),
    onSuccess: () => {
      toast.success("Session terminated successfully")
    },
    onError: () => {
      toast.error("Failed to terminate session")
    },
  })

  const terminateOtherSessionsMutation = useMutation({
    ...postApiAuthLogoutAllMutation(),
    onSuccess: () => {
      toast.success("All other sessions terminated successfully")
    },
    onError: () => {
      toast.error("Failed to terminate other sessions")
    },
  })

  const login = useCallback(
    (credentials: LoginRequest) => {
      loginMutation.mutate({ body: credentials })
    },
    [loginMutation],
  )

  const logout = useCallback(() => {
    logoutMutation.mutate({})
  }, [logoutMutation])

  return {
    login,
    logout,
    getApiUserMe,
    isLoggedIn: sessionStore.getIsLoggedIn(),
    isLoading: sessionStore.isLoading || loginMutation.isPending || logoutMutation.isPending,
    error: sessionStore.error,
    lastActivity: sessionStore.lastActivity,
    terminateSession: terminateSessionMutation.mutate,
    terminateOtherSessions: terminateOtherSessionsMutation.mutate,
  }
}
