import { ReactNode } from "react"
import "@/shared/i18n"
interface I18nProviderProps {
  children: ReactNode
}

export function I18nProvider({ children }: I18nProviderProps) {
  return <>{children}</>
}
