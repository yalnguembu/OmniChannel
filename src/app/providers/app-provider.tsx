import { QueryProvider } from "./query-provider"
import { I18nProvider } from "./i18n-provider"
import { RouterProviderWrapper } from "./router-provider"

export function AppProvider() {
  return (
    <QueryProvider>
      <I18nProvider>
        <RouterProviderWrapper />
      </I18nProvider>
    </QueryProvider>
  )
}
