import { createFileRoute, redirect } from "@tanstack/react-router"
import { DashboardLayout } from "@/shared/components/layouts/DashboardLayout"
import { useSessionStore } from "@/shared/stores/sessionStore"

export const Route = createFileRoute("/_protected")({
  beforeLoad: () => {
    const { getIsLoggedIn } = useSessionStore.getState()
    if (!getIsLoggedIn()) {
      throw redirect({ to: "/auth/login" })
    }
  },
  component: DashboardLayout,
})
