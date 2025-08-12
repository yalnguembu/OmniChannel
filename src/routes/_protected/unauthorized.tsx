import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { Button } from "@/shared/components/ui/button"
import { useTranslation } from "react-i18next"
import Forbidden from "@/assets/images/illustration/forbidden.svg"

export const Route = createFileRoute("/_protected/unauthorized")({
  component: Unauthorized,
})

function Unauthorized() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center justify-center h-[35rem] text-center p-4">
      <img src={Forbidden} alt="Access Denied" className="w-64 max-w-full mb-6" />
      <h1 className="text-xl font-semibold mb-2 text-red-600">{t("accessDenied")}</h1>
      <p className="text-muted-foreground text-sm mb-6">{t("noPermission")}</p>
      <Button onClick={() => navigate({ to: "/" })}>{t("goHome")}</Button>
    </div>
  )
}
