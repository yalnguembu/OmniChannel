import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiCurrencyMutation,
    putApiCurrencyMutation,
    deleteApiCurrencyByIdMutation,
    getApiCurrencyByIdQueryKey,
    getApiCurrencyDetailByIdQueryKey,
    getApiCurrencyDropdownQueryKey,
    postApiCurrencySearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreateCurrencyRequest, UpdateCurrencyRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const useCurrencyMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiCurrencyDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiCurrencySearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["currency", "search"] })
    }

    const createCurrencyMutation = useMutation({
        ...postApiCurrencyMutation(),
        onSuccess: () => {
            toast.success(t("currency.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updateCurrencyMutation = useMutation({
        ...putApiCurrencyMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("currency.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiCurrencyByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiCurrencyDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deleteCurrencyMutation = useMutation({
        ...deleteApiCurrencyByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("currency.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiCurrencyByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiCurrencyDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("currency.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiCurrencyByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("currency.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("currency.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("currency.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("currency.bulk.deleteError"))
    })

    const createCurrencyWithValidation = (data: CreateCurrencyRequest, setError: UseFormSetError<CreateCurrencyRequest>, onSuccess?: () => void) => {
        createCurrencyMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("currency.messages.create.error")
                }),
            },
        )
    }

    const updateCurrencyWithValidation = (data: UpdateCurrencyRequest, setError: UseFormSetError<UpdateCurrencyRequest>, onSuccess?: () => void) => {
        updateCurrencyMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("currency.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createCurrencyMutation,
        updateMutation: updateCurrencyMutation,
        deleteMutation: deleteCurrencyMutation,
        bulkDeleteMutation,
        createCurrencyWithValidation,
        updateCurrencyWithValidation,
        deleteCurrency: (id: string) => deleteCurrencyMutation.mutate({ path: { id } }),
        isMutating: createCurrencyMutation.isPending || updateCurrencyMutation.isPending || deleteCurrencyMutation.isPending || bulkDeleteMutation.isPending
    }
}
