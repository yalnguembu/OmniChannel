import { createFileRoute, redirect } from "@tanstack/react-router"
import { useSessionStore } from "@/shared/stores/sessionStore"

import { authPersistence } from "@/shared/lib/api/authPersistence"

const Logout = () => <></>

export const Route = createFileRoute("/_public/auth/logout")({
  beforeLoad: () => {
    const { resetSession } = useSessionStore.getState()
    resetSession()
    authPersistence.clearAuthData()
    const returnUrl = new URL(window.location.href).searchParams.get("returnUrl") || "/dashboard"
    throw redirect({ to: "/auth/login" + "?returnUrl=" + encodeURIComponent(returnUrl) })
  },
  component: Logout,
})
