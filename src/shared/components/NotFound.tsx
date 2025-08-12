import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import NotFoundImage from "@/assets/images/illustration/not-found.svg"
import { Button } from "@/shared/components/ui/button"
// import { Copyright } from "./auth/Copyright"
import { useRouter } from "@tanstack/react-router"
import { HousePlug, MoveLeft } from "lucide-react"

export const NotFound = () => {
  const navigate = useNavigate()
  const router = useRouter()
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center p-4">
      <img src={NotFoundImage} alt="Page not found" className="w-64 max-w-full mb-6" />
      <h1 className="text-xl font-semibold mb-2 text-yellow-600">{t("pageNotfound")}</h1>
      <p className="text-muted-foreground text-sm mb-6">{t("noRessource")}</p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => router.history.back()}>
          <MoveLeft />
          {t("goBack")}
        </Button>
        <Button onClick={() => navigate({ to: "/" })}>
          <HousePlug />
          {t("goHome")}
        </Button>
      </div>
      <div className="absolute bottom-10">{/* <Copyright /> */}</div>
    </div>
  )
}
