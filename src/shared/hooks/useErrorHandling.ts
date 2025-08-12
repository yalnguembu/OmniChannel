// import { useQueryClient } from '@tanstack/react-query'
import { createErrorHandler, handleRequestError } from "@/shared/lib/errorHandling"
import { RedirectRule } from "../types/error"

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

  return {
    createMutationErrorHandler,
    createQueryErrorConfig,
    handleRequestError,
  }
}
