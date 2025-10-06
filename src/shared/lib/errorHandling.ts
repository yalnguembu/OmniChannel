import { toast } from "sonner"
import { useErrorStore } from "@/shared/stores/errorStore"
import { AxiosError } from "axios"
import type { ErrorType, RedirectRule, ValidationErrorResponse } from "../types/error"
import type { FieldErrors, FieldValues, Path, UseFormSetError } from "react-hook-form"

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

  const errorData = error.response?.data as ValidationErrorResponse
  const errorMessage = errorData?.detail || errorData?.message || (error as AxiosError).message || toastMessage || "An error occurred"
  const errorStatus = error.status || error.response?.status || errorData?.status || 500

  // Check if this is a validation error
  if (errorData?.errorCode === "VALIDATION_FAILED" && errorData?.validationErrors) {
    // For validation errors, show all validation messages
    if (showToast) {
      const allErrors = Object.entries(errorData.validationErrors).map(([field, errors]) => {
        return `${field}: ${Array.isArray(errors) ? errors.join(", ") : errors}`
      })
      toast.error(errorData.title || "Validation Error", {
        description: allErrors.join("\n"),
        duration: 5000,
      })
    }
  } else {
    // For other errors, show the detail message
    if (storeError) {
      storeError(errorMessage)
    }

    if (showToast) {
      toast.error(errorMessage)
    }
  }

  const handleRedirectRule = (rule: RedirectRule) => {
    if (errorStatus === rule.status) {
      location.replace(rule.path + "?returnUrl=" + encodeURIComponent(location.pathname))
    }
  }

  if (redirectRules && Array.isArray(redirectRules)) redirectRules.forEach(handleRedirectRule)
  else if (redirectRules) handleRedirectRule(redirectRules)
}

/**
 * Map API validation errors to React Hook Form errors
 * @param error - The error from the API
 * @param setError - React Hook Form's setError function
 * @returns true if validation errors were set, false otherwise
 */
export const mapValidationErrorsToForm = <T extends FieldValues>(error: ErrorType, setError: UseFormSetError<T>): boolean => {
  const errorData = error.response?.data as ValidationErrorResponse

  if (errorData?.errorCode === "VALIDATION_FAILED" && errorData?.validationErrors) {
    Object.entries(errorData.validationErrors).forEach(([field, errors]) => {
      const errorMessages = Array.isArray(errors) ? errors : [errors]
      // Convert field name to camelCase (e.g., "Email" -> "email", "InitialPassword" -> "initialPassword")
      const fieldName = field.charAt(0).toLowerCase() + field.slice(1)

      setError(fieldName as Path<T>, {
        type: "server",
        message: errorMessages.join(". "),
      })
    })
    return true
  }

  return false
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
