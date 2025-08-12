import { useTranslation } from "react-i18next"
import type { TFunction } from "i18next"

/**
 * Enhanced translation helper for typed translation keys
 * Provides better debugging and fallback handling
 */
export const createTranslationHelper = (t: TFunction) => {
  return (key: string, options?: any) => {
    try {
      // Try to get the translation
      const translated = t(key, options)

      // Check if translation actually occurred
      if (typeof translated === "string" && translated !== key) {
        return translated
      }

      // If translation failed, try to get it with explicit string casting
      const explicitTranslated = t(key as any, options)
      if (typeof explicitTranslated === "string" && explicitTranslated !== key) {
        return explicitTranslated
      }

      // Log warning for debugging
      console.warn(`Translation missing or failed for key: ${key}`)

      // Return a user-friendly fallback instead of the key
      const fallback = key.split(".").pop() || key
      return fallback.charAt(0).toUpperCase() + fallback.slice(1)
    } catch (error) {
      console.error(`Translation error for key ${key}:`, error)
      return key
    }
  }
}

/**
 * Hook for company-specific translations
 */
export const useCompanyTranslation = () => {
  const { t } = useTranslation()
  return createTranslationHelper(t)
}
