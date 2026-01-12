import { createFileRoute, redirect } from "@tanstack/react-router"
import { useSessionStore } from "@/features/auth/stores/sessionStore"

import { authPersistence } from "@/shared/lib/api/authPersistence"

import PageLoader from "@/shared/components/PageLoader"
const Logout = () => <></>

export const Route = createFileRoute("/_public/auth/logout")({
  beforeLoad: () => {
    const { resetSession } = useSessionStore.getState()
    resetSession()
    authPersistence.clearAuthData()
    const returnUrl = new URL(window.location.href).searchParams.get("returnUrl") || "/dashboard"
    throw redirect({ to: "/auth/login" + "?returnUrl=" + encodeURIComponent(returnUrl) })
  },
  pendingComponent: PageLoader,
  component: Logout,
})
