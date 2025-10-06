// import { useQueryClient } from '@tanstack/react-query'
import { createErrorHandler, handleRequestError, mapValidationErrorsToForm } from "@/shared/lib/errorHandling"
import { RedirectRule } from "../types/error"
import type { FieldValues, UseFormSetError } from "react-hook-form"

/**
 * Hook for handling API errors consistently across the application
 */
export const useErrorHandling = () => {
  // const queryClient = useQueryClient()

  /**
   * Create an error handler for mutations
   */
  const createMutationErrorHandler = (
    options: {
      toastMessage?: string
      storeError?: (message: string) => void
      redirectRules?: RedirectRule | RedirectRule[]
      showToast?: boolean
    } = {},
  ) => {
    return createErrorHandler(options)
  }

  /**
   * Create error handling config for queries
   */
  const createQueryErrorConfig = (
    options: {
      toastMessage?: string
      storeError?: (message: string) => void
      redirectRules?: RedirectRule | RedirectRule[]
      showToast?: boolean
      onError?: (error: any) => void
    } = {},
  ) => {
    const { onError, ...rest } = options

    return {
      onError: (error: any) => {
        handleRequestError(error, rest)
        if (onError) {
          onError(error)
        }
      },
    }
  }

  /**
   * Create error handler for mutations with form validation error mapping
   * Use this in mutation onError callbacks to automatically map API validation errors to form fields
   */
  const createFormMutationErrorHandler = <T extends FieldValues>(
    setError: UseFormSetError<T>,
    options: {
      toastMessage?: string
      showToast?: boolean
      onError?: (error: any) => void
    } = {},
  ) => {
    return (error: any) => {
      // Try to map validation errors to form fields
      const mapped = mapValidationErrorsToForm(error, setError)

      // If no validation errors were mapped, show the error via toast
      if (!mapped) {
        handleRequestError(error, {
          showToast: options.showToast !== false,
          toastMessage: options.toastMessage,
        })
      }

      // Call custom error handler if provided
      if (options.onError) {
        options.onError(error)
      }
    }
  }

  return {
    createMutationErrorHandler,
    createQueryErrorConfig,
    createFormMutationErrorHandler,
    handleRequestError,
    mapValidationErrorsToForm,
  }
}
