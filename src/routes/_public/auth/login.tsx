import { createFileRoute, redirect } from "@tanstack/react-router"
import { LoginForm } from "@/features/auth/components/LoginForm"
import { useSessionStore } from "@/features/auth/stores/sessionStore"
import AppLogo from "@/assets/images/logo/icon.png"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_public/auth/login")({
  beforeLoad: () => {
    const { getIsLoggedIn } = useSessionStore.getState()
    const returnUrl = new URL(window.location.href).searchParams.get("returnUrl") || "/dashboard"
    if (returnUrl && getIsLoggedIn()) {
      throw redirect({ to: returnUrl })
    }
    if (getIsLoggedIn()) {
      throw redirect({ to: "/dashboard" })
    }
  },
  pendingComponent: PageLoader,
  component: () => (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <img src={AppLogo} alt="Logo" className="h-12 w-auto mb-4" />
          <h2 className="text-2xl font-bold">Template Web Platform</h2>
        </div>
        <LoginForm />
      </div>
    </div>
  ),
})
