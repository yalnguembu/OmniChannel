import { QueryProvider } from "./query-provider"
import { I18nProvider } from "./i18n-provider"
import { RouterProviderWrapper } from "./router-provider"
import { setupAxiosInterceptors } from "@/shared/lib/api/config"
import { useEffect, useState } from "react"
import { Toaster } from "@/shared/components/ui/sonner"

export function AppProvider() {
  const [isAppInitiated, setIsAppIniated] = useState<boolean>(false)

  useEffect(() => {
    if (isAppInitiated) return

    setupAxiosInterceptors()
    setIsAppIniated(true)
  }, [])

  return (
    <QueryProvider>
      <I18nProvider>
        <RouterProviderWrapper />
      </I18nProvider>
      <Toaster duration={5000} style={{ background: "var(--bg-background)" }} />
    </QueryProvider>
  )
}
