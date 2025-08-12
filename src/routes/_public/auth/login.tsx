import { createFileRoute, redirect } from "@tanstack/react-router"
import { LoginForm } from "@/features/auth/components/LoginForm"
import { useSessionStore } from "@/shared/stores/sessionStore"
import AppLogo from "@/assets/images/logo/icon.png"

export const Route = createFileRoute("/_public/auth/login")({
  beforeLoad: () => {
    const { getIsLoggedIn } = useSessionStore.getState()
    if (getIsLoggedIn()) {
      throw redirect({ to: "/dashboard" })
    }
  },
  component: () => (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <img src={AppLogo} alt="Logo" className="h-12 w-auto mb-4" />
          <h2 className="text-2xl font-bold">FujiPay Platform</h2>
        </div>
        <LoginForm />
      </div>
    </div>
  ),
})
