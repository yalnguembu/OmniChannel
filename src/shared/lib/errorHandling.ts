import { toast } from "sonner"
import { useErrorStore } from "@/shared/stores/errorStore"
import { AxiosError } from "axios"
import type { ErrorType, RedirectRule } from "../types/error"

export const handleRequestError = (
  error: ErrorType,
  options: {
    showToast?: boolean
    toastMessage?: string
    storeError?: (message: string) => void
    redirectRules?: RedirectRule | RedirectRule[]
  } = {},
) => {
  const { showToast = true, toastMessage, storeError, redirectRules } = options
  const { setError } = useErrorStore.getState()

  setError(error)

  const errorMessage = error.response?.data?.detail || error.response?.data?.message || (error as AxiosError).message || toastMessage || "An error occurred"
  const errorStatus = error.status || error.response?.status || error.response?.data?.status || 500

  if (storeError) {
    storeError(errorMessage)
  }

  if (showToast) {
    toast.error(errorMessage)
  }

  const handleRedirectRule = (rule: RedirectRule) => {
    if (errorStatus === rule.status) {
      location.replace(rule.path)
    }
  }

  if (redirectRules && Array.isArray(redirectRules)) redirectRules.forEach(handleRedirectRule)
  else if (redirectRules) handleRedirectRule(redirectRules)
}

export const createErrorHandler = (
  options: {
    showToast?: boolean
    toastMessage?: string
    storeError?: (message: string) => void
    redirectRules?: RedirectRule | RedirectRule[]
  } = {},
) => {
  return (error: ErrorType) => handleRequestError(error, options)
}
