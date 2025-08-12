import { createFileRoute, redirect } from "@tanstack/react-router"
import { useSessionStore } from "@/shared/stores/sessionStore"

import { authPersistence } from "@/shared/lib/api/authPersistence"

const Logout = () => <></>

export const Route = createFileRoute("/_public/auth/logout")({
  beforeLoad: () => {
    const { resetSession } = useSessionStore.getState()
    resetSession()
    sessionStorage.clear()
    authPersistence.clearAuthData()
    throw redirect({ to: "/auth/login" })
  },
  component: Logout,
})
