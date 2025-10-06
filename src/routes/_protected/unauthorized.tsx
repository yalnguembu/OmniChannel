import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router"
import { Button } from "@/shared/components/ui/button"
import { useTranslation } from "react-i18next"
import { useEffect } from "react"
import { useSessionStore } from "@/shared/stores/sessionStore"
import Forbidden from "@/assets/images/illustration/forbidden.svg"

import PageLoader from "@/shared/components/PageLoader"
export const Route = createFileRoute("/_protected/unauthorized")({
  pendingComponent: PageLoader,
  component: Unauthorized,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      redirect: (search.redirect as string) || "/",
    }
  },
})

function Unauthorized() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const search = useSearch({ from: "/_protected/unauthorized" })
  const { userPermissions } = useSessionStore()

  useEffect(() => {
    if (!search.redirect || search.redirect === "/unauthorized" || !userPermissions) {
      return
    }

    if (userPermissions.length > 0) {
      navigate({ to: search.redirect as any })
    }
  }, [userPermissions, search.redirect, navigate])

  return (
    <div className="flex flex-col items-center justify-center h-[35rem] text-center p-4">
      <img src={Forbidden} alt="Access Denied" className="w-64 max-w-full mb-6" />
      <h1 className="text-xl font-semibold mb-2 text-red-600">{t("accessDenied")}</h1>
      <p className="text-muted-foreground text-sm mb-6">{t("noPermission")}</p>
      <div className="flex gap-x-4">
        <Button onClick={() => navigate({ to: "/dashboard" })}>{t("goHome")}</Button>
        <Button variant="outline" onClick={() => navigate({ to: search.redirect })}>
          {t("goBack")}
        </Button>
      </div>
    </div>
  )
}
