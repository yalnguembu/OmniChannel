import { createFileRoute } from "@tanstack/react-router"
import { DashboardLayout } from "@/shared/components/layouts/DashboardLayout"
import { useSessionStore } from "@/features/auth/stores/sessionStore"
import PageLoader from "@/shared/components/PageLoader"

export const Route = createFileRoute("/_protected")({
  // beforeLoad: async () => {
  //   const sessionStore = useSessionStore.getState()
  //   if (!sessionStore.getIsLoggedIn()) {
  //     throw redirect({
  //       to: "/auth/login",
  //       search: {
  //         redirect: window.location.pathname,
  //       },
  //     })
  //   }
  // },
  loader: async () => {
    const sessionStore = useSessionStore.getState()
    return {
      session: sessionStore.user,
    }
  },
  pendingComponent: PageLoader,
  component: DashboardLayout,
})
