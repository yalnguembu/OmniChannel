import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { createErrorHandler } from "@/shared/lib/errorHandling"
import { useErrorHandling } from "@/shared/hooks/useErrorHandling"
import {
    postApiWalletTransactionMutation,
    putApiWalletTransactionMutation,
    deleteApiWalletTransactionByIdMutation,
    getApiWalletTransactionByIdQueryKey,
    getApiWalletTransactionDetailByIdQueryKey,
    getApiWalletTransactionDropdownQueryKey,
    postApiWalletTransactionSearchQueryKey,
} from "@/shared/api/@tanstack/react-query.gen"
import { CreateWalletTransactionRequest, UpdateWalletTransactionRequest } from "@/shared/api/types.gen"
import type { UseFormSetError } from "react-hook-form"

export const useWalletTransactionMutations = () => {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const { createFormMutationErrorHandler } = useErrorHandling()

    const invalidateCommonQueries = () => {
        queryClient.invalidateQueries({ queryKey: getApiWalletTransactionDropdownQueryKey() })
        queryClient.invalidateQueries({ queryKey: postApiWalletTransactionSearchQueryKey() })
        queryClient.invalidateQueries({ queryKey: ["walletTransaction", "search"] })
    }

    const createWalletTransactionMutation = useMutation({
        ...postApiWalletTransactionMutation(),
        onSuccess: () => {
            toast.success(t("walletTransaction.messages.create.success"))
            invalidateCommonQueries()
        },
        onError: (error) => {
            if (!error) return;
        }
    })

    const updateWalletTransactionMutation = useMutation({
        ...putApiWalletTransactionMutation(),
        onSuccess: (result, variables) => {
            toast.success(t("walletTransaction.messages.update.success"))
            invalidateCommonQueries()

            if (result.success === true && variables.body?.id) {
                const id = variables.body.id
                queryClient.invalidateQueries({ queryKey: getApiWalletTransactionByIdQueryKey({ path: { id } }) })
                queryClient.invalidateQueries({ queryKey: getApiWalletTransactionDetailByIdQueryKey({ path: { id } }) })
            }
        },
    })

    const deleteWalletTransactionMutation = useMutation({
        ...deleteApiWalletTransactionByIdMutation(),
        onSuccess: (_, variables) => {
            toast.success(t("walletTransaction.messages.delete.success"))
            invalidateCommonQueries()

            if (variables.path?.id) {
                const id = variables.path.id
                queryClient.removeQueries({ queryKey: getApiWalletTransactionByIdQueryKey({ path: { id } }) })
                queryClient.removeQueries({ queryKey: getApiWalletTransactionDetailByIdQueryKey({ path: { id } }) })
            }
        },
        onError: () =>
            createErrorHandler({
                toastMessage: t("walletTransaction.messages.delete.error"),
            }),
    })

    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const results = await Promise.allSettled(
                ids.map((id) =>
                    deleteApiWalletTransactionByIdMutation().mutationFn!({
                        path: { id },
                        query: { deletionReason: t("walletTransaction.bulk.deleteReason") },
                    }),
                ),
            )
            return results
        },
        onSuccess: (results) => {
            const successCount = results.filter((r) => r.status === "fulfilled").length
            const failureCount = results.filter((r) => r.status === "rejected").length

            if (successCount > 0) {
                toast.success(t("walletTransaction.messages.delete.success", { count: successCount }))
                invalidateCommonQueries()
            }

            if (failureCount > 0) {
                toast.error(t("walletTransaction.bulk.partialError", { count: failureCount }))
            }
        },
        onError: () =>
            toast.error(t("walletTransaction.bulk.deleteError"))
    })

    const createWalletTransactionWithValidation = (data: CreateWalletTransactionRequest, setError: UseFormSetError<CreateWalletTransactionRequest>, onSuccess?: () => void) => {
        createWalletTransactionMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("walletTransaction.messages.create.error")
                }),
            },
        )
    }

    const updateWalletTransactionWithValidation = (data: UpdateWalletTransactionRequest, setError: UseFormSetError<UpdateWalletTransactionRequest>, onSuccess?: () => void) => {
        updateWalletTransactionMutation.mutate(
            { body: data },
            {
                onSuccess: () => onSuccess?.(),
                onError: createFormMutationErrorHandler(setError, {
                    toastMessage: t("walletTransaction.messages.update.error")
                }),
            },
        )
    }

    return {
        createMutation: createWalletTransactionMutation,
        updateMutation: updateWalletTransactionMutation,
        deleteMutation: deleteWalletTransactionMutation,
        bulkDeleteMutation,
        createWalletTransactionWithValidation,
        updateWalletTransactionWithValidation,
        deleteWalletTransaction: (id: string) => deleteWalletTransactionMutation.mutate({ path: { id } }),
        isMutating: createWalletTransactionMutation.isPending || updateWalletTransactionMutation.isPending || deleteWalletTransactionMutation.isPending || bulkDeleteMutation.isPending
    }
}
