import { useTranslation } from "react-i18next"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { useSessionStore } from "@/features/auth/stores/sessionStore"
import PageLoader from "@/shared/components/PageLoader"

function LandingPage() {
  const { t } = useTranslation()

  return (
    <div className="text-gray-800">
      <h1>{t("landingPage.title")}</h1>
    </div>
  )
}

export const Route = createFileRoute("/_public/")({
  pendingComponent: PageLoader,
  component: LandingPage,
  beforeLoad: () => {
    const { getIsLoggedIn } = useSessionStore.getState()
    const returnUrl = new URL(window.location.href).searchParams.get("returnUrl") || "/"
    if (returnUrl && getIsLoggedIn()) {
      throw redirect({ to: returnUrl })
    }
    if (getIsLoggedIn()) {
      throw redirect({ to: "/" })
    } else {
      throw redirect({ to: "/auth/login" })
    }
  },

})
